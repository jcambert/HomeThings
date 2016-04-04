(function() {
  'use strict';

  angular
    .module('homeThingsDiagram')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

})();
