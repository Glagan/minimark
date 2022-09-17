# minimark

[![npm version](https://badge.fury.io/js/@glagan%2Fminimark.svg)](https://badge.fury.io/js/@glagan%2Fminimark)

**minimark** is a Svelte library that render nodes from a string with **markdown** like tags.  
The text is converted to nodes that are then displayed as Svelte components, without any html assignments.

## Installation

```bash
yarn add @glagan/minimark # or npm install @glagan/minimark
```

## How to use

You only need to use the ``<Minimark>`` component to render text:

```svelte
<Minimark text="This will be renderer **in bold**" />
```

## Tags

You can insert links, images and stylize text by using tags that resemble **Markdown**.
Most of these tags can be nested to combine their effects.

| Name | Description |
|---|---|
| Inline code | \`\`code\`\` |
| Header (h1) | ``# Header 1\n`` |
| Header (h2) | ``## Header 2\n`` |
| Link | ``{{title\|http://www.example.org/}}`` or ``{{http://www.example.org/}}`` without title. |
| Image | ``![title\|http://www.example.org/image.jpg]`` or ``![http://www.example.org/image.jpg]`` without title. |
| Bold | ``**http://www.example.org/**`` |
| Italic | ``*http://www.example.org/*`` |
| Separator | ``\n---\n`` |
| Float right | ``>*>Text<`` |

Tags work by looking for an open token, an optional separator if there is a title, and the close token.
If the tag can have a *title* you need to use ``|`` as the separator with the *content*.

You can add custom tags easily with the ``addTag(definition)`` function.
A tag object can have the following properties:

## Variables

There are two usable *variables* inside attribute values ``textContent`` and ``title``:

* ``$content``: the content found between the ``open`` and ``close`` token, without the title if there is one.
* ``$title``: the title found, if there is none it is replaced by the same value as ``$content``.
