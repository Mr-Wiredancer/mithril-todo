"use strict";

//namespace
var app = {};

//model definition
app.Todo = function(data) {
  this.description = m.prop(data.description || "");
  this.done = m.prop(data.done || false);
};

//a singleton model, which acts as a databae interface
app.storage = (function() {
  var STORAGE_ID = 'jj';

  return {
    get: function() {
      return JSON.parse(localStorage.getItem(STORAGE_ID)) || [];
    },
    put: function(todos) {
      if (todos) {
        localStorage.setItem(STORAGE_ID, JSON.stringify(todos));
      }
    }

  }
}());

//view-model that holds states of UI
app.vm = (function() {
  var vm = {};

  vm.init = function() {
    vm.list = app.storage.get().map(function(data, index) {
      return new app.Todo(data);
    });

    vm.description = m.prop('');

    vm.add = function() {
      if (vm.description()) {
        vm.list.push(new app.Todo({
          description: vm.description(),
        }));
        app.storage.put(vm.list);
        vm.description('');
      }
    };

    vm.remove = function(index) {
      if (index>=0 && index < vm.list.length) {
        vm.list.splice(index, 1);
        app.storage.put(vm.list);
      }
    }

    vm.complete = function(index, done) {
        if (index>=0 && index < vm.list.length) {
          vm.list[index].done(done);
          app.storage.put(vm.list);
        }
    }
  };

  return vm;
}());

// naive controller, which does nothing but initialize the view-model
app.controller = function() {
  app.vm.init();
};

// view of app
app.view = function() {
  return m("div", [
    m("input", {onchange: m.withAttr('value', app.vm.description), value: app.vm.description()}),
    m("button", {onclick: app.vm.add}, "add"),
    m("div", app.vm.list.map(function(todo, index) {
      return m("div", [
        m("input[type=checkbox]", {onchange: m.withAttr('checked', app.vm.complete.bind(app.vm, index)), checked: todo.done()}),
        m("span", {style: {textDecoration: todo.done()?'line-through':'none'}}, todo.description()),
        m("a[href='javascript:void(0)']", {onclick: app.vm.remove.bind(app.vm, index)}, '删除')
        ]);
    }))]);
};

//magic, which connects everything
m.module(document.getElementById('main'), app);