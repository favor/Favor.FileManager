Favor File Manager v 0.0.1
==========================

Purpose
-------

The Favor File Manager is an Angular Module which is used to manage lists of 'open files'. There are two types of open files. 

1. The 'files' list, was originally designed to be used for a list of open tabs, like tabs at the top of your browser. 
2. The 'activeFiles' list, which is used to manage a list of tabs which are open, for example, used in side-by-side editing. 

Requirements
------------

* Angular.js >=1.2.5

Usage
-----

1. Include the dist/favorFileManager.js file in your html.
2. Add Favor.FileManager as a dependency in your Angular.js App. 

*The File Manager does not manage any of the file system I/O tasks (save, delete, create, etc), but only manages open files. For File I/O tasks, see http://github.com/favor/Favor.FileSystemManager*

To open a file
* The favorFileManagerCtrl exposes the $scope.openFile(file) object which will check that the file is not already in the open file list. This is also exposed through the $scope.$on('favorOpenFile'..) method which will respond to $scope.$emit or $scope.$broadcast events. the 'favorOpenFile' expects the file to be a file object, and if it is passed a string, will assume the string is the path and create a file object using the string the path. 

To close a file
* The favorFileManagerCtrl exposes the $scope.closeFile(file) object which will check that the file contents has not changed and either close the file or go through the 'save file' process. 