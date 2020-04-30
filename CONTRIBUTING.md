# Contributing to this COVID-19 dashboard

Hello, and thanks for your interest! This is an early project, but we welcome people who are interested in contributing.

## Setting Up a Development Environment

1. Install Node.js and the npm command line interface if you haven't already. You can find OS-specific instructions [here](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

2. Fork the COVID-19 dashboard repo and run `npm install`. The dashboard is a single page app written in Typescript with the following libaries:

* [Parcel](https://parceljs.org/) for bundling and deployment
* [Preact](https://preactjs.com/), a ReactJS alternative, for layout and component management
* [Tachyons](http://tachyons.io/) as a lightweight styling library

3. Enable your dev environment with by running `npm run dev`. This should build and start a local development server on port 1234. You can point your browser at http://localhost:1234 to see it in action. Any changes should automatically trigger a rebuild and refresh.

## Contributing

### How to contribute changes?

Fork the repo, make your changes to your own repo, and submit a pull request [here](https://github.com/jayrbolton/covid19-growth-dashboard/pulls).

### What does the project need?
There are plenty of ways to contribute!

* There's not a lot of documentation right now, more is always welcome.
* Check out the existing [issues](https://github.com/jayrbolton/covid19-growth-dashboard/issues), assign yourself, and jump in.
* Bring up a new issue. Bug reports, feature requests, and anything else is welcome.

### Conventions

* UI components are organized in a tree hierarchy, and this hierarchy should be reflected in the directory structure within `src/components`.
* Component methods for handling events have the prefix `handle` (eg. `handleClickButton`)
* Event handlers that are passed down in props have the prefix `on` (eg. `onSaveUser`)
* Component methods that return virtual-dom nodes have the prefix `render` (eg. `renderLoginForm`)
* Methods that set a component's state, but do not handle a particular event, have the prefix `set` (eg. `setDate`)
* Component classes should have the top-down method order of: constructor, hooks, setters, event handlers, and render
* Additional render functions should go outside the class as a simple way to keep the classes smaller
* Typescript is used, and types should be declared where convenient/descriptive, but otherwise we are not strict about it

## Thanks for your interest! 
