import { textToNode } from '$lib/Adapter';
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
});
