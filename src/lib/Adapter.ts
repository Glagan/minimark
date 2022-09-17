import { tags, type TagToken } from './Tags';

export type Node = { childs?: Node[]; attributes?: Record<string, unknown> } & (
	| { tag: string; classes?: string; title?: string; textContent?: string }
	| { textContent: string }
);

type ParsingNode = string | { tag: TagToken; textContent?: string; childs?: ParsingNode[] };

type TagLength = { open: number; close: number };
type TagBound = [globalIndex: number, stringIndex: number];

/**
 * Search the first occurence of the char occurence in text that doesn't have a \ prefix
 */
function firstUnbreakChar(text: string, char: string, start = 0): number {
	if (start < 0) start = 0;
	let foundPos = -1;
	while (start >= 0) {
		foundPos = text.indexOf(char, start);
		if (foundPos > 0 && text[foundPos - 1] == '\\') {
			start = foundPos + 1;
		} else {
			start = -1;
		}
	}
	return foundPos;
}

function searchToken(parsingNodes: ParsingNode[], token: string, start: TagBound): TagBound {
	const found: [number, number] = [start[0], start[1]];
	for (let max = parsingNodes.length; found[0] < max; found[0]++) {
		if (
			typeof parsingNodes[found[0]] == 'string' &&
			(found[1] = (parsingNodes[found[0]] as string).indexOf(token, found[1])) > -1
		) {
			return found;
		}
		found[1] = 0;
	}
	return [-1, -1];
}

/**
 * Break string by tag tokens
 * Loop trough all tokens by order of importance and capture the largest pattern
 */
function transformParsingNodes(parsingNodes: ParsingNode[]) {
	for (let i = 0, last = tags.length; i < last; i++) {
		const tag: TagToken = tags[i];
		const tagLength: TagLength = { open: tag.open.length, close: tag.close.length };
		const continueAt: TagBound = [0, 0];
		let openPos: TagBound = [-1, -1];

		while ((openPos = searchToken(parsingNodes, tag.open, continueAt))[0] > -1) {
			openPos[1] += tagLength.open;
			// Tags with only an opening token and no closing token
			// -- The tag can only be found in the same string (not a ParsingNode)
			// -- There is no need to check for parts across multiple nodes since it can only be in the same string
			if (tagLength.close == 0) {
				// Insert the string before the found tag before the new parsing node element
				const substring = parsingNodes[openPos[0]] as string;
				if (openPos[1] - tagLength.open > 0) {
					parsingNodes.splice(openPos[0]++, 0, substring.slice(0, openPos[1] - tagLength.open));
				}
				// Insert the newly created token
				parsingNodes.splice(openPos[0]++, 0, { tag });
				// Update the string in parsingNodes to only include the remaining of the string without the tag
				// -- handle empty string (end of the original string) and remove them
				if (openPos[1] < substring.length) {
					parsingNodes[openPos[0]] = substring.slice(openPos[1]);
				} else {
					parsingNodes.splice(openPos[0], 1);
				}
				continueAt[0] = openPos[0];
				continueAt[1] = 0;
			}
			// Tags with a closing token
			else {
				// Search the closing token of the matched tag
				const closePos = searchToken(parsingNodes, tag.close, openPos);
				if (closePos[0] > -1) {
					// Check if we need to join parts from multiple parts
					if (openPos[0] === closePos[0]) {
						// Insert the string before the found tag before the new parsing node element
						const substring = parsingNodes[openPos[0]] as string;
						if (openPos[1] - tagLength.open > 0) {
							parsingNodes.splice(openPos[0]++, 0, substring.slice(0, openPos[1] - tagLength.open));
						}
						const textContent = substring.slice(openPos[1], closePos[1]);
						parsingNodes.splice(openPos[0]++, 0, { tag, textContent });
						// Update the string in parsingNodes to only include the remaining of the string without the tag
						// -- handle empty string (end of the original string) and remove them
						if (closePos[1] + tagLength.close < substring.length) {
							parsingNodes[openPos[0]] = substring.slice(closePos[1] + tagLength.close);
						} else {
							parsingNodes.splice(openPos[0], 1);
						}
						continueAt[0] = openPos[0];
						continueAt[1] = 0;
					} else {
						const childs: ParsingNode[] = [];
						let insertChildsAtIndex = 0;
						const openingSubstring = parsingNodes[openPos[0]] as string;
						const closingSubstring = parsingNodes[closePos[0]] as string;
						// Update the string before the found tag before the new parsing node element
						// -- Remove the string if it was now empty
						// -- handle empty string (end of the original string) and remove them
						if (openPos[1] - tagLength.open > 0) {
							parsingNodes[openPos[0]++] = openingSubstring.slice(0, openPos[1] - tagLength.open);
						} else {
							parsingNodes.splice(openPos[0], 1);
							closePos[0] -= 1;
						}
						// Cut the part after the opening token as a child of the new node
						if (openPos[1] < openingSubstring.length) {
							childs.push(openingSubstring.slice(openPos[1]));
							insertChildsAtIndex = 1;
						}
						// Extract the remaining string in the closing part
						// -- and add it as a node after the new node
						// -- handle empty string (end of the original string) and remove them
						if (closePos[1] + tagLength.close < closingSubstring.length) {
							parsingNodes[closePos[0]] = closingSubstring.slice(closePos[1] + tagLength.open);
						} else {
							parsingNodes.splice(closePos[0], 1);
						}
						if (closePos[1] > 0) {
							childs.push(closingSubstring.slice(0, closePos[1]));
						}
						// Remove parts between the two opening and closing tokens a childs to a new parsing node
						if (closePos[0] - openPos[0] > 0) {
							childs.splice(
								insertChildsAtIndex,
								0,
								...parsingNodes.splice(openPos[0], closePos[0] - openPos[0], { tag, childs })
							);
						}
						transformParsingNodes(childs);
						continueAt[0] = openPos[0] + 1;
						continueAt[1] = 0;
					}
				} else {
					// If no closing token was found once for the tag
					// -- no other closing token will be found even if there is other opening tokens
					// -- we can safely exit the loop and try the next tag
					break;
				}
			}
		}
	}
}

// Convert parsing node to real usable GetRootNodeOptions
// -- also process nested nodes by using textToNode on each found nodes if the tag allow it
function convertParsingNodes(parsingNode: string | ParsingNode): Node {
	if (typeof parsingNode === 'string') {
		return { textContent: parsingNode };
	}
	const tag = parsingNode.tag;
	let title: string | undefined;
	let textContent = parsingNode.textContent;
	const node: Node = { tag: tag.tag, classes: tag.classes };
	if (tag.extractTitle && textContent) {
		if (textContent.indexOf('!') === 0) {
			textContent = textContent.slice(1);
		} else {
			const foundTitleBreak = firstUnbreakChar(textContent, '|');
			if (foundTitleBreak > -1) {
				textContent = textContent.replace('\\|', '|');
				title = textContent.slice(0, foundTitleBreak);
				textContent = textContent.slice(foundTitleBreak + 1);
			}
		}
	}
	if (title === undefined) {
		title = textContent;
	}
	node.title = title;
	node.textContent = textContent;
	// Replace tokens in attributes
	if (tag.attributes) {
		const keys = Object.keys(tag.attributes);
		node.attributes = {};
		for (let k = 0, max = keys.length; k < max; k++) {
			const attributeValue = tag.attributes[keys[k]]
				.replace('$title', title ?? '')
				.replace('$content', textContent ?? '');
			node.attributes[keys[k]] = attributeValue;
		}
	}
	// If a textContent is manually set on the Tag
	// -- Replace the tokens inside it and assign it
	if (parsingNode.tag.textContent) {
		node.textContent = parsingNode.tag.textContent
			.replace('$title', title ?? '')
			.replace('$content', textContent ?? '');
	}
	// -- Else if there is no textContent, apply textToNode in a nested way
	else if (parsingNode.tag.textContent == undefined && 'tag' in parsingNode && textContent) {
		const childs = textToNode(textContent);
		if (childs.length > 1 || 'tag' in childs[0]) {
			node.title = undefined;
			node.textContent = undefined;
			node.childs = childs;
		}
	}
	if (parsingNode.childs) {
		node.childs = parsingNode.childs.map(convertParsingNodes);
	}
	return node;
}

export function textToNode(text: string): Node[] {
	if (text == undefined) return [];
	// Normalize linebreaks
	const parsingNodes: ParsingNode[] = [text.replace(/(\r?\n|\r)/gm, '\n')];
	transformParsingNodes(parsingNodes);
	return parsingNodes.map(convertParsingNodes);
}
