var Graph = require("./graph");
var ReactiveFunction = require("./reactiveFunction");

var stringIdentifiers = require("./stringIdentifiers");
var encodeReactiveFunction = stringIdentifiers.encodeReactiveFunction;
var encodeProperty         = stringIdentifiers.encodeProperty;

// This is the singleton dependency graph
// shared by all instances of ReactiveModel.
var dependencyGraph = new Graph();

// Each model gets a unique id.
// This is so (model, property) pairs can be identified by strings,
// and those strings can be used as node ids in the dependency graph.
// For example, the string "3.foo" identifies the "foo" property of model with id 3.
var modelIdCounter = 0;

function ReactiveModel(){

  // Enforce use of new.
  // See http://stackoverflow.com/questions/17032749/pattern-for-enforcing-new-in-javascript
  if (!(this instanceof ReactiveModel)) {
    return new ReactiveModel();
  }

  // Refer to `this` (the ReactiveModel instance) as `model`, for code clarity.
  var model = this;

  // Each model gets a unique id.
  model.id = modelIdCounter++;

  model.react = function (options){

    var reactiveFunctions = ReactiveFunction.parse(options);

    reactiveFunctions.forEach(function (λ){

      var λNode = encodeReactiveFunction(λ);
      var outNode = encodeProperty(model, λ.outProperty);

      dependencyGraph.addEdge(λNode, outNode);

      λ.inProperties.forEach(function (inProperty){
        var inNode = encodeProperty(model, inProperty);
        dependencyGraph.addEdge(inNode, λNode);
        //track(inProperty);
      });
    });

    return reactiveFunctions;
  };
}

// Expose internals for unit testing only.
ReactiveModel.dependencyGraph = dependencyGraph;
ReactiveModel.encodeReactiveFunction = encodeReactiveFunction;
ReactiveModel.encodeProperty = encodeProperty;

module.exports = ReactiveModel;

//
//function allAreDefined(arr){
//  return !arr.some(isNotDefined);
//}
//
//function isNotDefined(d){
//  return typeof d === 'undefined' || d === null;
//}
//
//function debounce(callback){
//  var queued = false;
//  return function () {
//    if(!queued){
//      queued = true;
//      setTimeout(function () {
//        queued = false;
//        callback();
//      }, 0);
//    }
//  };
//}
//
//export function ReactiveModel(){
//
//  if (!(this instanceof ReactiveModel)) {
//    return new ReactiveModel();
//  }
//
//  var model = this;
//  var values = {};
//  var trackedProperties = {};
//  var reactiveFunctions = {};
//
//  function getReactiveFunctions(inProperty){
//    if( !(inProperty in reactiveFunctions) ){
//      return reactiveFunctions[inProperty] = [];
//    } else {
//      return reactiveFunctions[inProperty];
//    }
//  }
//
//  var invoke = function(reactiveFunction){
//    var args = reactiveFunction.inProperties.map( function (inProperty){
//      return values[inProperty];
//    });
//    if(allAreDefined(args)){
//      reactiveFunction.callback.apply(null, args);
//    }
//  };
//
//  model.react = function (options){
//    Object.keys(options).forEach( function (outProperty){
//
//      var arr = options[outProperty];
//
//      var inPropertiesStr = arr[0];
//      var callback        = arr[1]; 
//
//      var inProperties = inPropertiesStr.split(",").map( function (inPropertyStr){
//        return inPropertyStr.trim();
//      });
//
//      var reactiveFunction = ReactiveFunction(inProperties, outProperty, callback);
//
//      inProperties.forEach(function (inProperty){
//        getReactiveFunctions(inProperty).push(reactiveFunction);
//        track(inProperty);
//      });
//
//      invoke(reactiveFunction);
//    });
//  };
//
//  function track(property){
//    if( !trackedProperties[property] ){
//      trackedProperties[property] = true;
//
//      var previousValue = model[property];
//
//      Object.defineProperty(model, property, {
//        get: function (){
//          return values[property];
//        },
//        set: function (value){
//          values[property] = value;
//          
//          // TODO test this path
//          //getReactiveFunctions(property).forEach(invoke);
//        }
//      });
//
//      if(!isNotDefined(previousValue)){
//        model[property] = previousValue;
//      }
//    }
//  }
//
//  return model;
//};