import textToNode from '$lib/Adapter';
import { describe, expect, it } from 'vitest';

describe('Simple examples', () => {
	it('should parse single textContent', () => {
		const result = textToNode('test');
		expect(result).toMatchObject([{ textContent: 'test' }]);
	});

	it('should render simple tags', () => {
		const result = textToNode('**test**');
		expect(result).toMatchObject([
			{ tag: 'span', classes: 'bold', title: 'test', textContent: 'test' }
		]);
	});

	it('should render simple tags', () => {
		const result = textToNode('*test*');
		expect(result).toMatchObject([
			{ tag: 'span', classes: 'italic', title: 'test', textContent: 'test' }
		]);
	});

	it('should replace all new lines', () => {
		let result = textToNode('\n');
		expect(result).toMatchObject([
			{ tag: 'br', classes: undefined, title: undefined, textContent: undefined }
		]);
		result = textToNode('\r');
		expect(result).toMatchObject([
			{ tag: 'br', classes: undefined, title: undefined, textContent: undefined }
		]);
		result = textToNode('\r\n');
		expect(result).toMatchObject([
			{ tag: 'br', classes: undefined, title: undefined, textContent: undefined }
		]);
	});

	it('should replace nested tags', () => {
		const result = textToNode('# *Header*\n');
		expect(result).toMatchObject([
			{
				tag: 'h1',
				classes: 'header',
				title: undefined,
				textContent: undefined,
				childs: [{ tag: 'span', classes: 'italic', title: 'Header', textContent: 'Header' }]
			}
		]);
	});

	it('should replace tokens in attributes tags', () => {
		const result = textToNode('![image|/image.png]');
		expect(result).toMatchObject([
			{
				tag: 'img',
				classes: undefined,
				title: 'image',
				textContent: '/image.png',
				attributes: {
					alt: 'image',
					src: '/image.png',
					title: 'image'
				}
			}
		]);
	});

	it('should replace multiple tags in the same string', () => {
		const result = textToNode('# header\n![image|/image.png]\n\n\n\nand some **text**');
		expect(result).toMatchObject([
			{
				tag: 'h1',
				classes: 'header',
				title: 'header',
				textContent: 'header'
			},
			{
				tag: 'img',
				classes: undefined,
				title: 'image',
				textContent: '/image.png',
				attributes: {
					src: '/image.png',
					alt: 'image',
					title: 'image'
				}
			},
			{
				tag: 'br',
				classes: undefined,
				title: undefined,
				textContent: undefined
			},
			{
				tag: 'br',
				classes: undefined,
				title: undefined,
				textContent: undefined
			},
			{
				tag: 'br',
				classes: undefined,
				title: undefined,
				textContent: undefined
			},
			{
				tag: 'br',
				classes: undefined,
				title: undefined,
				textContent: undefined
			},
			{ textContent: 'and some ' },
			{
				tag: 'span',
				classes: 'bold',
				title: 'text',
				textContent: 'text'
			}
		]);
	});

	it("doesn't replace tags with disabled nested content", () => {
		const result = textToNode('``this text *should* not be **bold**``');
		expect(result).toMatchObject([
			{
				tag: 'code',
				classes: 'code',
				title: 'this text *should* not be **bold**',
				textContent: 'this text *should* not be **bold**'
			}
		]);
	});

	it('should replace any nested tags', () => {
		const result = textToNode('**[*[``final``]*]**');
		expect(result).toMatchObject([
			{
				tag: 'span',
				classes: 'bold',
				title: undefined,
				textContent: undefined,
				childs: [
					{ textContent: '[' },
					{
						tag: 'span',
						classes: 'italic',
						title: undefined,
						textContent: undefined,
						childs: [
							{ textContent: '[' },
							{
								tag: 'code',
								classes: 'code',
								title: 'final',
								textContent: 'final'
							},
							{ textContent: ']' }
						]
					},
					{ textContent: ']' }
				]
			}
		]);
	});

	it('should handle new lines correctly', () => {
		const result = textToNode('First line\nSecond line');
		expect(result).toMatchObject([
			{
				textContent: 'First line'
			},
			{
				tag: 'br'
			},
			{
				textContent: 'Second line'
			}
		]);
	});

	it('should handle multiple tags', () => {
		const result = textToNode(
			'Text can be *styled* **easily**, contain {{links|https://minimark.nikurasu.org/}} and even ``code`` !'
		);
		expect(result).toMatchObject([
			{
				textContent: 'Text can be '
			},
			{
				tag: 'span',
				classes: 'italic',
				title: 'styled',
				textContent: 'styled'
			},
			{
				textContent: ' '
			},
			{
				tag: 'span',
				classes: 'bold',
				title: 'easily',
				textContent: 'easily'
			},
			{
				textContent: ', contain '
			},
			{
				tag: 'a',
				title: 'links',
				textContent: 'links',
				attributes: {
					href: 'https://minimark.nikurasu.org/',
					target: '_blank',
					title: 'links'
				}
			},
			{
				textContent: ' and even '
			},
			{
				tag: 'code',
				classes: 'code',
				title: 'code',
				textContent: 'code'
			},
			{
				textContent: ' !'
			}
		]);
	});

	it('should handle headers with nested tags', () => {
		const result = textToNode('# First Header\n## *Second* header\n');
		expect(result).toMatchObject([
			{
				tag: 'h1',
				classes: 'header',
				title: 'First Header',
				textContent: 'First Header'
			},
			{
				tag: 'h2',
				classes: 'header',
				childs: [
					{
						tag: 'span',
						classes: 'italic',
						title: 'Second',
						textContent: 'Second'
					},
					{
						textContent: ' header'
					}
				]
			}
		]);
	});

	it('should handle multiple tags', () => {
		const result = textToNode(
			'You can easily __add__ your own style with the ``addTag()`` function.\nSee {{!https://github.com/Glagan/minimark#text-tag}} to know how.'
		);
		expect(result).toMatchObject([
			{
				textContent: 'You can easily '
			},
			{
				tag: 'span',
				title: 'add',
				textContent: 'add',
				attributes: {
					class: 'add'
				}
			},
			{
				textContent: ' your own style with the '
			},
			{
				tag: 'code',
				classes: 'code',
				title: 'addTag()',
				textContent: 'addTag()'
			},
			{
				textContent: ' function.'
			},
			{
				tag: 'br'
			},
			{
				textContent: 'See '
			},
			{
				tag: 'a',
				title: 'https://github.com/Glagan/minimark#text-tag',
				textContent: 'https://github.com/Glagan/minimark#text-tag',
				attributes: {
					href: 'https://github.com/Glagan/minimark#text-tag',
					target: '_blank',
					title: 'https://github.com/Glagan/minimark#text-tag'
				}
			},
			{
				textContent: ' to know how.'
			}
		]);
	});

	it('should handle multiple tags and self closing tags', () => {
		const result = textToNode(
			'![You can add images|/javascript.png]\n---\nAnd you can separate content.'
		);
		expect(result).toMatchObject([
			{
				tag: 'img',
				title: 'You can add images',
				textContent: '/javascript.png',
				attributes: {
					src: '/javascript.png',
					alt: 'You can add images',
					title: 'You can add images'
				}
			},
			{
				tag: 'div',
				classes: 'separator'
			},
			{
				textContent: 'And you can separate content.'
			}
		]);
	});

	it('should handle the same line multiple times', () => {
		const result = textToNode('**[*[``final``]*]**\n**[*[``final``]*]**');
		expect(result).toMatchObject([
			{
				tag: 'span',
				classes: 'bold',
				childs: [
					{
						textContent: '['
					},
					{
						tag: 'span',
						classes: 'italic',
						childs: [
							{
								textContent: '['
							},
							{
								tag: 'code',
								classes: 'code',
								title: 'final',
								textContent: 'final'
							},
							{
								textContent: ']'
							}
						]
					},
					{
						textContent: ']'
					}
				]
			},
			{
				tag: 'br'
			},
			{
				tag: 'span',
				classes: 'bold',
				childs: [
					{
						textContent: '['
					},
					{
						tag: 'span',
						classes: 'italic',
						childs: [
							{
								textContent: '['
							},
							{
								tag: 'code',
								classes: 'code',
								title: 'final',
								textContent: 'final'
							},
							{
								textContent: ']'
							}
						]
					},
					{
						textContent: ']'
					}
				]
			}
		]);
	});
});
