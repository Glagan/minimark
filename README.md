# minimark

[![npm version](https://badge.fury.io/js/@glagan%2Fminimark.svg)](https://badge.fury.io/js/@glagan%2Fminimark)

**minimark** is a Svelte library that render nodes from a string with **markdown** like tags.  
The text is converted to nodes that are then displayed as Svelte components, without any html assignments.

You can find a demo with a live preview of the rendered text at [http://minimark.nikurasu.org/](http://minimark.nikurasu.org/).

## Installation

```bash
pnpm add @glagan/minimark
```

## How to use

You only need to use the ``<Minimark>`` component to render text:

```jsx
<Minimark text="This will be renderer **in bold**" />
```

The generated node will be surrounded by a ``<div>`` by default, but you can use any tag you want by setting the ``tag`` props.

## Tags

You can insert links, images and stylize text by using tags that resemble **Markdown**.
Most of these tags can be nested to combine their effects.

| Name | Description | CSS |
|---|---|---|
| Inline code | \`\`code\`\` | ``code`` |
| Header (h1) | ``# Header 1\n`` |  |
| Header (h2) | ``## Header 2\n`` |  |
| Link | ``{{title\|http://www.example.org/}}`` or ``{{http://www.example.org/}}`` without title. |
| Image | ``![title\|http://www.example.org/image.jpg]`` or ``![http://www.example.org/image.jpg]`` without title. |
| Bold | ``**http://www.example.org/**`` | ``bold`` |
| Italic | ``*http://www.example.org/*`` | ``italic`` |
| Separator | ``\n---\n`` | ``separator`` |
| Float right | ``>*>Text<`` | ``float-right`` |

Tags work by looking for an open token, an optional separator if there is a title, and the close token.
If the tag can have a *title* you need to use ``|`` as the separator with the *content*.

You can add custom tags easily with the ``addTag(definition)`` function.
A tag object can have the following properties:

```typescript
import { addTag } from '@glagan/minimark';

addTag({
    tag: "span", // The node tag, e.g <span>
    classes: "class1 class2", // Optional classes as a string
    attributes: {
        name: "value"
    }, // Optional attributes to set
    textContent: "$content", // textContent of the created node, see below for variables
                             // If textContent is defined and not false the content cannot have childs (nested other tags)
							 // If textContent is set to false, it"s ignored (for self-closing tags)
    open: "{{", // The opening token - any length
    close: "}}" // The closing token - can be linebreak by using \n - can also be empty
});
```

## Variables

There are two usable *variables* inside attribute values ``textContent`` and ``title``:

* ``$content``: the content found between the ``open`` and ``close`` token, without the title if there is one.
* ``$title``: the title found, if there is none it is replaced by the same value as ``$content``.
