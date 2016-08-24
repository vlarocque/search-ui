# Search-UI [![Build Status](https://travis-ci.org/coveo/search-ui.svg?branch=master)](https://travis-ci.org/coveo/search-ui) [![TypeScript](https://badges.frapsoft.com/typescript/version/typescript-v18.svg?v=100)](https://github.com/ellerbrock/typescript-badges/)
Coveo Search UI Framework

<img src='./docs/readme.png' />

## Install
    npm install --save coveo-search-ui
    
All resources will be available under `node_modules/coveo-search-ui/bin`. 

## Basic usage

```
<!-- Include the library scripts. -->
<script src="js/CoveoJsSearch.js"></script>
<script src="js/CoveoJsSearch.Dependencies.js"></script>
<script src="js/templates/templatesNew.js"></script>

<!-- Every DOM element with a class starting with Coveo (uppercase) will instantiate a component. -->
<body id="search" class='CoveoSearchInterface'>
    
    <!-- Every DOM element with a class starting with coveo- (lowercase) is only for css/alignment purpose. -->
    <div class='coveo-search-section'>
        
        <!-- Every Coveo Component can be removed (or added) and none are actually required for the page to "load". -->
        <div class="CoveoSearchbox"></div>
    </div>
    
    <!-- The data- attributes on each component allow to pass option for a specific component instance. -->
    <div class="CoveoFacet" data-title="Author" data-field="@author" data-tab="All"></div>
    <div class="CoveoFacet" data-title="Year" data-field="@year" data-tab="All"></div>


    <script>
        // Configure an endpoint to perform search.
        // Coveo.SearchEndpoint.configureCloudEndpoint('MyCoveoCloudEnpointName', 'my-authentification-token');
        
        // We provide a sample endpoint with public sources for demo purposes.
        Coveo.SearchEndpoint.configureSampleEndpoint();
        // Initialize the framework by targeting the root in the interface.
        // It does not have to be the body of the document.
        Coveo.init(document.body);
    </script>
</body>

```

See more examples of fully configured pages in `./pages`.


## Build
    npm install -g gulp
    npm install
    gulp
    
## Important gulp tasks
* `gulp default` -> Build the whole project (css, templates, typescript, etc.)
* `gulp compile` -> Build only the typescript code and generate it's output in the `./bin` folder
* `gulp css` -> Build only the sass code and generate its output in the `./bin` folder
* `gulp sprites` -> Regenerate the sprites image as well as the generated sass/css code.
* `gulp test` -> Build and run the unit tests.
* `gulp doc` -> Generate the documentation website for the project.

## Dev

Ensure that you were able to run `gulp` completely without any error first. Then you can start the dev-server.

    gulp dev

This will start a [webpack-dev-server instance](https://webpack.github.io/docs/webpack-dev-server.html).
Load [http://localhost:8080/index.html](http://localhost:8080/index.html) in a web browser.

Any time you hit **Save** in a source file, the bundle will be recompiled, and the dev page will reload.

If you need to modify the content of the search page (the markup itself and not the typescript code), modify the `Index.html` page under `./bin`. This page is not committed in the repository, so don't be afraid to break anything. However, if you need to modify the original `Index.html` for a good reason, feel free to do so.

## Build a custom version of the library.

For advanced users and people concerned with loading speed in their integration, there is a way to compile a completely customized version of the library by including only the component you wish to use.

A classic use case would be someone wanting to display only a search box with a minimal result list, with no facet, no tabs, or any other more "advanced" components.

By building a bundle with only those components, you can cut down the size of the resulting javascript code by a substantial amount, without having to include useless code related to component you do not use.

* Install [plop](https://github.com/amwmedia/plop) globally with `npm install -g plop`.
* Change directory to `./plop`.
* Run `plop` to automatically start the small command line utility, and choose the components you wish to include in your bundle.
* Run `node plop.build.js` to compile the file created in `./bin/`.
* Once compilation finished, your new bundle should be available in `./bin/CoveoJsSearch.Custom.js`.

### I want to add a new component!

First, fork our repo.

* Create a new folder under `./src/ui/` that match the name of your component. Then, create a `.ts` file that match the same name.
* Add your file to the `.tsconfig.json`.
* Create the basic scaffolding of your component. For example copy SearchButton (a very simple component), and change its ID + various imports.
* Export the class associated with your component in `./src/Index.ts` so that it is available in the global scope.
* Make it work! (your mileage may vary)

Now, add tests for your component.
* Create a new file matching your component name under `./test/ui`.
* Follow the same pattern that other components use (Copy SearchButton, for example). 
* You should try to test all public API of your component: This means all public methods as well as all available options.
* Reference your test file in `./test/Test.ts`.

Create a pull request to merge your changes in the master branch.

We are very eager to receive external contributions as well as collaborating with other developers!

### Tests

Tests are written with [jasmine](http://jasmine.github.io/2.4/introduction.html). To run them you can either call `npm run test` to run tests in phantom js, or open `./test/SpecRunner.html` in a web browser and easier debugging.

To rebuild tests: `gulp buildTest`

To rebuild and run tests: `gulp test`

NB : Calling `gulp test` does *NOT* rebuild the main library code. If you change any code under `./src`, you must first recompile using `gulp compile`

## Documentation
Generated using typedoc. Available [here](https://coveo.github.io/search-ui/)
