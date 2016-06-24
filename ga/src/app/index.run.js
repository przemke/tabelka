(function() {
  'use strict';

  angular
    .module('ga')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

})();
