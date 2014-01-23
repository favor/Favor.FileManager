'use static';

angular.module('Favor.FileManager',[])
.factory('FavorFileModel',function($rootScope){
	var fileMeta;

	FileObj = {};
	FileObj.openFile = function(path){
		fs.readFile(path,"utf-8",function(err,data){
			if(err) return console.log(data);
			fileMeta = createFileMeta(path,data);
			$rootScope.$broadcast('fileContentChanged', false,FileObj.file());
		});
	}

	FileObj.createFile = function(content){
		fileMeta = createFileMeta('', content || '');
		fileMeta.created_new = getTime();
		$rootScope.$broadcast('fileContentChanged',false, FileObj.file());
		return;
	}

	function createFileMeta(path,data){
			return {
					content: data,
					last_save: data,
					name: path.replace(/^.*[\\\/]/, ''),
					path: path,
					active: false,
					opened_at: getTime()
				}
	}

	function getTime(){
		return new Date().getTime().toString();
	}

	function unbindKeybindings(command){
		var remove_bindings=['A','F','H'];
		for(var k in remove_bindings){
			var binding = remove_bindings[k];
			command.addCommands([{
				name: 'unBind-Ctrl-'+binding,
				bindKey: {
					win: 'Ctrl-'+binding,
					mac: 'Command-'+binding
				},
				exec: function(editor, line){
					return;
				},
				readOnly: true
			}]);
		}
	}


	FileObj.file = function(){
		return fileMeta;
	}

	FileObj.ace = function(_ace){
		if(!fileMeta){
			fileMeta = createFileMeta('','');
		}
		unbindKeybindings(_ace.commands);
		fileMeta.ace = _ace;
		return;
	}

	return FileObj;
})
.factory('FavorOpenFilesModel',function($rootScope, $q, FavorFileModel){
	
	var files = [];
	var activeFiles = [];
	var OpenFilesObj={};



	function changeActive(setActive){ // remove active files and set new active files
		angular.forEach(files, function(a){
			if(findFileIdx(a,setActive).length===1){
				a.active=true;
			} else {
				a.active=false;
			}
		});
		$rootScope.$broadcast('updateActiveFiles',activeFiles)
		return ;
	}

	function removeFromActive(file){
		activeFiles.splice(findFileIdx(file,activeFiles),1);
		file.active=false;
		changeActive(activeFiles);

	}

	function findMatchingFile(a,b){
		return (a.path!='' && a.path === b.path || a.opened_at == b.opened_at);
			
	}
	function findFileIdx(file, fileArray){
		return $.map(fileArray, function(f,i){
			if(findMatchingFile(f,file)){
				return i;
			}
		});
	}

	function closeFile(file){
		var idx = findFileIdx(file, files);
		removeFromActive(file);
		if(idx.length === 0){
			console.log("something went wrong, couldn't find file to close");
			return;
		} else {
			var i = idx[0];
			files.splice(i,1);
			if(file.active===true && files.length>0){
				changeActive(i<files.length ? [i] : [i-1]);
			}
		}

		$rootScope.$broadcast('updateOpenFiles',files);

 	}

	OpenFilesObj.openFile = function(multi,file){
		var isOpen = findFileIdx(file, files);
		if(isOpen.length === 0){ //file was not found in array of open files
			files.push(file);
		//	isOpen.push(files.length-1);
		}
		if(file.active===true) return removeFromActive(file);
		if(multi==='click' || !multi) return changeActive(activeFiles=[file]);
		activeFiles.push(file);
		if(multi==='ctrl-click') return changeActive(activeFiles);
	}

	OpenFilesObj.checkFileIsOpen = function(file){
		if(files.length===0 || findFileIdx({path:file},files).length===0) return FavorFileModel.openFile(file); 
		return OpenFilesObj.openFile(false,files[findFileIdx({path:file},files)[0]]); //find in the tabs and set to active
	}

	OpenFilesObj.files = function(){
		return files;
	}

	OpenFilesObj.activeFiles = function(){
		return activeFiles;
	}
	OpenFilesObj.setActive = function(files){
		checkifFilesAreActive;
		return changeActive(files);
	}

	OpenFilesObj.close = function(file){
		if(file.last_save!=file.content){
			file.close_after_save = true;
			if(file.path===''){
				$rootScope.$broadcast('saveAs',file);
			}
		} else {
			closeFile(file);
		}
	}

	return OpenFilesObj;
})
.controller('FavorOpenFilesCtrl',function($scope, FavorOpenFilesModel, FavorFileModel){

	$scope.files = FavorOpenFilesModel.files();
	$scope.activeFiles = FavorOpenFilesModel.activeFiles();
	$scope.searchTerm = '';

	$scope.newFile = function(){
		FavorFileModel.createFile();
		return;
	}

	$scope.sortableOptions = {
		items: "li:not(.disabled)"
	}

	$scope.setActive = function(click,file){
		FavorOpenFilesModel.openFile(click,file);
	};

	$scope.favorFocusBindings = {
		'click': $scope.setActive,
		'ctrl-click': $scope.setActive
	}

	function clearSearch(){
		for(var i=0;i<$scope.files.length;i++){
			delete $scope.files[i].fileNameMatch;
			delete $scope.files[i].contentMatchesFound;
		}
	}
	$scope.searchFiles = function(){
		if($scope.searchTerm==='') return clearSearch();
		for(var i=0; i<$scope.files.length;i++){
			var file=$scope.files[i];
			var regexContent = new RegExp($scope.searchTerm,'g');
			var contentMatches = file.content.match(regexContent);
			file.contentMatchesFound = contentMatches ? contentMatches.length : 0;
			file.fileNameMatch = file.name.toLowerCase().indexOf($scope.searchTerm.toLowerCase());
		}
	}

	$scope.openFile = function(file){
		FavorOpenFilesModel.checkFileIsOpen(file);
	}

	$scope.closeFile = function(file){
		FavorOpenFilesModel.close(file);
	}
	
	$scope.$on('openFile',function(event,file){
		FavorOpenFilesModel.checkFileIsOpen(file);
	});

	$scope.$on('fileContentChanged',function(event,multi,file){
		FavorOpenFilesModel.openFile(multi,file);
		$scope.$apply();
	});

	$scope.$on('closeFile',function(event,file){
		FavorOpenFilesModel.close(file);
	});

	$scope.$on('updateOpenFiles',function(event,files){
		$scope.files = files;
	});

	$scope.$on('updateActiveFiles',function(event,files){
		$scope.activeFiles = files;
		angular.forEach(files, function(file){
			if(file.ace){
				file.ace.env.onResize(true)
			}
		});
	});

	$scope.$on('favorSearch',function(event,searchTerm){
		$scope.searchTerm=searchTerm;
		$scope.searchFiles();
	});
});

