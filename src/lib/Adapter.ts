import { tags, type TagToken } from './Tags';

export type Node = { childs?: Node[]; attributes?: Record<string, unknown> } & (
	| { tag: string; classes?: string; title?: string; textContent?: string }
	| { textContent: string }
);

type ParsingNode = { tag: TagToken; textContent?: string; childs?: ParsingNode[] };

type TagLength = { open: number; close: number };

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

function searchToken(string: string, token: string, start: number): number {
	return string.indexOf(token, start);
}

export function textToNode(text: string): Node[] {
	if (text == undefined) return [];
	// Normalize linebreak
	text = text.replace(/(\r?\n|\r)/gm, '\n');
	const textLength = text.length;
	// Break string by tokens
	// -- Loop trough all tokens by order of importance and capture the largest pattern
	const parsingNodes: (string | ParsingNode)[] = [text];
	for (let i = 0, last = tags.length; i < last; i++) {
		const tag: TagToken = tags[i];
		const tagLength: TagLength = { open: tag.open.length, close: tag.close.length };
		for (let s = 0; s < parsingNodes.length; s++) {
			let substring = parsingNodes[s];
			if (typeof substring !== 'string') {
				continue;
			}
			let continueAt = 0;
			let openPos = -1;

			while (
				continueAt < textLength &&
				(openPos = searchToken(substring, tag.open, continueAt)) > -1
			) {
				openPos += tagLength.open;
				// Tags with only an opening token and no closing token
				if (tagLength.close == 0) {
					// Insert the string before the found tag before the new parsing node element
					if (openPos - tagLength.open > continueAt) {
						parsingNodes.splice(s++, 0, substring.slice(continueAt, openPos - tagLength.open));
					}
					// Insert the newly created token
					parsingNodes.splice(s++, 0, { tag });
					// Update the string in parsingNodes to only include the remaining of the string without the tag
					// TODO handle empty string after tag ?
					substring = substring.slice(openPos);
					parsingNodes[s] = substring;
					continueAt = 0;
				} else {
					const closePos = searchToken(substring, tag.close, openPos);
					if (closePos > -1) {
						// Insert the string before the found tag before the new parsing node element
						if (openPos - tagLength.open > continueAt) {
							parsingNodes.splice(s++, 0, substring.slice(continueAt, openPos - tagLength.open));
						}
						const textContent = substring.slice(openPos, closePos);
						parsingNodes.splice(s++, 0, { tag, textContent });
						continueAt = closePos + tagLength.close;
						// Update the string in parsingNodes to only include the remaining of the string without the tag
						// TODO handle empty string after tag ?
						substring = substring.slice(closePos + tagLength.close);
						parsingNodes[s] = substring;
						continueAt = 0;
					} else {
						continueAt = openPos;
					}
				}
			}
		}
	}
	// TODO continueAt - textLength as a text node
	console.log('parsingNodes', parsingNodes);
	// Convert parsing node to real usable Nodes
	// -- also process nested nodes by using textToNode on each found nodes if the tag allow it
	const nodes: Node[] = [];
	for (const parsingNode of parsingNodes) {
		if (typeof parsingNode === 'string') {
			nodes.push({ textContent: parsingNode });
		} else {
			const tag = parsingNode.tag;
			let title: string | undefined;
			let textContent = parsingNode.textContent;
			let node: Node = { tag: tag.tag, textContent, classes: tag.classes };
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
						.replace('$content', textContent ?? '')
						.replace('$title', title ?? '');
					node.attributes[keys[k]] = attributeValue;
				}
			}
			// If a textContent is manually set on the Tag
			// -- Replace the tokens inside it and assign it
			if (parsingNode.tag.textContent) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				textContent = parsingNode
					.textContent!.replace('$content', textContent ?? '')
					.replace('$title', title ?? '');
				node.textContent = textContent;
			}
			// -- Else if there is no textContent, apply textToNode in a nested way
			else if (parsingNode.tag.textContent == undefined && textContent) {
				const childs = textToNode(textContent);
				if (childs.length > 1) {
					node = childs[0];
					node.childs = childs.slice(1);
					nodes.push(node);
				}
			}
			nodes.push(node);
		}
	}
	console.log('nodes', nodes);
	return nodes;
}
