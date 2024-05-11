/* global NexT, CONFIG, Pjax */

var pjax = new Pjax({
  selectors: ['head title', 'script[type="application/json"]',
  // Precede .main-inner to prevent placeholder TOC changes asap
  '.post-toc-wrap', '.main-inner', '.languages', '.pjax'],
  switches: {
    '.post-toc-wrap': function postTocWrap(oldWrap, newWrap) {
      if (newWrap.querySelector('.post-toc')) {
        Pjax.switches.outerHTML.call(this, oldWrap, newWrap);
      } else {
        var curTOC = oldWrap.querySelector('.post-toc');
        if (curTOC) {
          curTOC.classList.add('placeholder-toc');
        }
        this.onSwitch();
      }
    }
  },
  analytics: false,
  cacheBust: false,
  scrollTo: !CONFIG.bookmark.enable
});
document.addEventListener('pjax:success', function () {
  pjax.executeScripts(document.querySelectorAll('script[data-pjax]'));
  NexT.boot.refresh();
  // Define Motion Sequence & Bootstrap Motion.
  if (CONFIG.motion.enable) {
    NexT.motion.integrator.init().add(NexT.motion.middleWares.subMenu).add(NexT.motion.middleWares.postList)
    // Add sidebar-post-related transition.
    .add(NexT.motion.middleWares.sidebar).bootstrap();
  }
  if (CONFIG.sidebar.display !== 'remove') {
    var hasTOC = document.querySelector('.post-toc:not(.placeholder-toc)');
    document.querySelector('.sidebar-inner').classList.toggle('sidebar-nav-active', hasTOC);
    NexT.utils.activateSidebarPanel(hasTOC ? 0 : 1);
    NexT.utils.updateSidebarPosition();
  }
});