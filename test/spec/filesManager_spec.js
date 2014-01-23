'use strict';

describe('FileSystem', function () {
  var scope;

  beforeEach(angular.mock.module('Favor.FileManager'));
  beforeEach(angular.mock.inject(function($rootScope,$controller){
  	scope = $rootScope.$new();
  	$controller('FavorOpenFilesCtrl',{$scope:scope});
  })
  );

  describe('open files',function(){
    it('should have multiple open files', function(){
       scope.files = fileManagerMock;
       expect(scope.files.length).toBeGreaterThan(1);
    });
  });

  describe('search files',function(){
    it('should matching file names to search match true', function(){
      scope.files = fileManagerMock;
      scope.searchTerm = 'test';
      scope.searchFiles();
      expect(scope.files[0].fileNameMatch).toBeGreaterThan(-1);
      expect(scope.files[1].fileNameMatch).toBeGreaterThan(-1);

      scope.searchTerm = 'e2';
      scope.searchFiles();
      expect(scope.files[0].fileNameMatch).toBeLessThan(0);
      expect(scope.files[1].fileNameMatch).toBeGreaterThan(-1);
    });

    it('should search file contents for matching string', function(){
      scope.files=fileManagerMock;
      scope.searchTerm = 'at';
      scope.searchFiles();
      expect(scope.files[0].contentMatchesFound).toBe(2);
      expect(scope.files[1].contentMatchesFound).toBe(4);

      scope.searchTerm = 'time';
      scope.searchFiles();
      expect(scope.files[0].contentMatchesFound).toBe(0);
      expect(scope.files[1].contentMatchesFound).toBe(0);

      scope.searchTerm = 'da';
      scope.searchFiles();
      expect(scope.files[0].contentMatchesFound).toBe(6);
      expect(scope.files[1].contentMatchesFound).toBe(2);
    });

  });
});
