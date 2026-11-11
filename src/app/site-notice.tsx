import './site-notice.css';

export default function SiteNotice() {
  return <section className="site-notice wrap" aria-labelledby="site-notice-title">
    <div className="site-notice-intro"><span>关于这本人物册</span><p>粉丝自制 · 非官方 · 非营利<br/>认真标明来处，也尊重每一位创作者。</p><a href="#guestbook/rights">素材异议与私密联系 ↗</a></div>
    <details className="site-notice-details">
      <summary id="site-notice-title">关于本站与素材说明 <span>展开阅读 ＋</span></summary>
      <div className="site-notice-copy">
        <p>本项目为粉丝自制的非营利人物整理档案，不属于周涛本人、央视及任何官方机构出品，也不代表上述个人或机构。</p>
        <p>生平资料、语录整理自公开媒体报道、节目访谈及本人公开发布的内容，相关条目附有可追溯的来源。章节串联、主题归类与阅读笔记为整理者的个人理解，不代表周涛本人观点；直接引语另作标注。</p>
        <p>图片、视频及原始文字作品的权利归相应权利人所有。图片保留已有水印与来源说明；注明来源不等于获得授权，本说明也不授予任何素材的转载或再使用许可。</p>
        <p>B站视频通过其官方播放器按需嵌入，视频文件由B站提供；其他影像链接至原发布平台，本站未另行上传视频文件。平台上传者未必是原始权利人，片源、上传者和年代说明见各条记录。</p>
        <p>本站用于爱好者查阅、交流与学习，不用于商业变现、广告引流或带货。阅读配乐的作者、音源与许可见配乐说明。</p>
        <p>如相关权利人对素材使用存在异议，请通过<a href="#guestbook/rights">私密反馈</a>提供具体页面或素材、权属依据及希望采取的处理方式。收到后将尽快核查并及时处理，必要时先暂停展示或移除对应内容。联系信息只供整理者处理反馈，请勿在公开留言中提交证件或其他敏感资料。</p>
      </div>
    </details>
  </section>;
}
