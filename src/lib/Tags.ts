export type TagDescription = {
	// Tag of the node
	tag: string;
	// Classes applied to the root node
	classes?: string;
	// Opening token
	open: string;
	// Closing token
	close: string;
	// Attributes added to the node
	attributes?: { textContent?: string | boolean } & { [key: string]: string };
	// Text content to replace the node text with
	textContent?: string | false;
};

export type TagToken = TagDescription & {
	extractTitle: boolean;
};

function initializeTag(tag: TagDescription): TagToken {
	const extractTitle =
		!!(tag.textContent && tag.textContent.indexOf('$title') >= 0) ||
		(tag.classes?.indexOf('$title') ?? -1) >= 0 ||
		!!(
			tag.attributes &&
			Object.values(tag.attributes).findIndex(
				(value) => typeof value === 'string' && value.indexOf('$title') >= 0
			) >= 0
		);
	return { ...tag, extractTitle };
}

const defaultTags: TagDescription[] = [
	{
		tag: 'code',
		classes: 'code',
		open: '``',
		close: '``',
		textContent: '$content'
	},
	{
		tag: 'h2',
		classes: 'header',
		open: '## ',
		close: '\n'
	},
	{
		tag: 'h1',
		classes: 'header',
		open: '# ',
		close: '\n'
	},
	{
		tag: 'img',
		attributes: {
			src: '$content',
			alt: '$title',
			title: '$title'
		},
		open: '![',
		close: ']',
		textContent: false
	},
	{
		tag: 'a',
		attributes: {
			href: '$content',
			target: 'blank',
			title: '$title'
		},
		textContent: '$title',
		open: '{{',
		close: '}}'
	},
	{
		tag: 'span',
		attributes: { class: '$title' },
		textContent: '$content',
		open: '__',
		close: '__'
	},
	{
		tag: 'span',
		classes: 'bold',
		open: '**',
		close: '**'
	},
	{
		tag: 'span',
		classes: 'float-right',
		open: '>*>',
		close: '<'
	},
	{
		tag: 'span',
		classes: 'italic',
		open: '*',
		close: '*'
	},
	{
		tag: 'div',
		classes: 'separator',
		open: '\n---\n',
		close: '',
		textContent: false
	},
	{
		tag: 'br',
		open: '\n',
		close: '',
		textContent: false
	}
];
export const tags: TagToken[] = defaultTags.map(initializeTag);

export function addTag(tag: TagDescription) {
	tags.push(initializeTag(tag));
}
