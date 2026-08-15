import React, { useState, useEffect } from 'react';
import SEOHead from '../components/SEOHead';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getTranslations } from '../i18n/detect';

export function getBlogArticles(t){
  return[
    {slug:'how-to-improve-english-speaking',title:t.blog.articles.howToImprove.title,excerpt:t.blog.articles.howToImprove.excerpt,date:'2026-01-15',readTime:'5 min',
     content:`<p>Speaking English fluently is a goal for millions of people worldwide. Whether you're preparing for a job interview, traveling abroad, or simply want to connect with more people, improving your English speaking skills is essential. Here are seven proven methods that actually work.</p>
<h2>1. Practice with Real People</h2><p>The most effective way to improve is through real conversation. Apps like <a href="/how-it-works">Chatter3</a> connect you with real English learners for 1-on-1 video calls. No scripts, no textbooks — just genuine conversation.</p>
<h2>2. Speak Every Day</h2><p>Consistency beats intensity. Speaking English for 5 minutes every day is better than one hour once a week. Build a daily habit and watch your confidence grow.</p>
<h2>3. Don't Fear Mistakes</h2><p>Every mistake is a learning opportunity. Native speakers make mistakes too! The key is to keep talking and learn from each error. If fear is holding you back, read our guide on <a href="/blog/how-to-overcome-fear-of-speaking-english">how to overcome the fear of speaking English</a>.</p>
<h2>4. Shadow Native Speakers</h2><p>Listen to podcasts, watch videos, and repeat what you hear. This technique, called "shadowing," helps you develop natural pronunciation and rhythm.</p>
<h2>5. Learn Phrases, Not Just Words</h2><p>Instead of memorizing individual words, learn common phrases and expressions. "How's it going?" is more useful than knowing the dictionary definition of each word. Check out our <a href="/blog/english-conversation-topics">50 conversation topics</a> for phrases you can use right away.</p>
<h2>6. Record Yourself</h2><p>Record your voice and listen back. You'll notice pronunciation issues you never heard before. It's uncomfortable but incredibly effective.</p>
<h2>7. Use Technology Wisely</h2><p>Apps like Chatter3 make it easy to find conversation partners anytime, anywhere. Use technology to practice, not just study. Compare the <a href="/blog/best-apps-for-english-conversation-practice">best apps for conversation practice</a> to find what works for you.</p>
<h2>Start Today</h2><p>The best time to start improving your English speaking is today. <a href="/">Join Chatter3</a> and have your first conversation in minutes.</p>`},
    {slug:'english-conversation-topics',title:t.blog.articles.conversationTopics.title,excerpt:t.blog.articles.conversationTopics.excerpt,date:'2026-01-10',readTime:'8 min',
     content:`<p>One of the biggest challenges in English practice is knowing what to talk about. You open your mouth, and your mind goes blank. Sound familiar? You're not alone. This guide gives you 50 conversation topics organized by difficulty level, plus example sentences to help you start each conversation with confidence.</p>
<h2>Why Having Topics Ready Matters</h2><p>When you practice English with a partner on <a href="/how-it-works">Chatter3</a>, you only have 5 minutes per session. That's not much time. Having topics ready means you spend less time thinking and more time speaking. The goal is fluency, not perfection.</p>
<h2>Beginner Topics (A1-A2)</h2><p>These topics use simple vocabulary and past/present tense. Perfect for your first conversations.</p>
<ul>
<li><strong>Tell me about yourself</strong> — "My name is... I'm from... I work as a..."</li>
<li><strong>What are your hobbies?</strong> — "I like... In my free time, I..."</li>
<li><strong>What's the weather like today?</strong> — "It's sunny/cloudy/rainy. I like/dislike the weather because..."</li>
<li><strong>Describe your family</strong> — "I have... My mother/father is... My sibling is..."</li>
<li><strong>What do you do for work?</strong> — "I'm a... I work at... My job involves..."</li>
<li><strong>What's your favorite food?</strong> — "I love... I usually eat... My favorite restaurant is..."</li>
<li><strong>Do you have any pets?</strong> — "Yes, I have a... Its name is... It likes to..."</li>
<li><strong>What time do you usually wake up?</strong> — "I wake up at... Then I... I always..."</li>
<li><strong>What did you do yesterday?</strong> — "Yesterday I went to... I saw... I ate..."</li>
<li><strong>Do you like sports?</strong> — "Yes, I play... I watch... My favorite team is..."</li>
<li><strong>What's your favorite movie?</strong> — "I watched... The story is about... I liked it because..."</li>
<li><strong>Describe your hometown</strong> — "My hometown is in... It's known for... The population is..."</li>
<li><strong>What's your favorite season?</strong> — "I like... because... In summer/winter I usually..."</li>
<li><strong>Do you like cooking?</strong> — "Yes, I often cook... My best dish is... I learned to cook from..."</li>
<li><strong>What music do you listen to?</strong> — "I like... My favorite artist is... I usually listen to..."</li>
</ul>
<h2>Intermediate Topics (B1-B2)</h2><p>These topics require opinion-based language and more complex sentence structures.</p>
<ul>
<li><strong>What are your goals for this year?</strong> — "This year I want to... My main goal is... I plan to..."</li>
<li><strong>Describe your dream vacation</strong> — "I'd love to visit... Because... I'd like to see..."</li>
<li><strong>What's the best advice you've ever received?</strong> — "Someone told me... It helped me because..."</li>
<li><strong>How has technology changed your life?</strong> — "Technology has... I use... It makes my life..."</li>
<li><strong>What would you do with a million dollars?</strong> — "First, I would... Then I'd... I think I'd also..."</li>
<li><strong>What's the best book you've read?</strong> — "I read... It's about... I recommend it because..."</li>
<li><strong>How do you handle stress?</strong> — "When I'm stressed, I... It helps me because..."</li>
<li><strong>What are the pros and cons of social media?</strong> — "On one hand... On the other hand... I think..."</li>
<li><strong>What's the most interesting thing you've learned recently?</strong> — "Recently I learned that... It surprised me because..."</li>
<li><strong>Describe a memorable experience</strong> — "Once, I... It was memorable because... I'll never forget..."</li>
<li><strong>What changes would you make to your city?</strong> — "I'd add... I'd remove... I think my city needs..."</li>
<li><strong>How do you learn new things?</strong> — "I usually... The best way for me is... I find that..."</li>
<li><strong>What's your opinion on remote work?</strong> — "I think remote work is... Because... In my experience..."</li>
<li><strong>Describe your morning routine</strong> — "I usually... Then I... After that I..."</li>
<li><strong>What's a skill you want to learn?</strong> — "I want to learn... Because... I think it would help me..."</li>
</ul>
<h2>Advanced Topics (C1-C2)</h2><p>These topics require abstract thinking, nuanced vocabulary, and the ability to discuss complex issues.</p>
<ul>
<li><strong>What impact will AI have on education?</strong> — "AI will transform... However, I believe... The challenge is..."</li>
<li><strong>Should governments regulate social media?</strong> — "I think regulation is... Because... A balanced approach would be..."</li>
<li><strong>What are the ethics of genetic engineering?</strong> — "On one hand... On the other hand... The ethical dilemma is..."</li>
<li><strong>How can we solve the climate crisis?</strong> — "The key steps are... Governments should... Individuals can..."</li>
<li><strong>What does success mean to you?</strong> — "For me, success is... It's not about... I believe..."</li>
<li><strong>Is globalization good or bad?</strong> — "Globalization has... It benefits... However, it also..."</li>
<li><strong>How has social media changed relationships?</strong> — "Social media has... It's made... I think the impact is..."</li>
<li><strong>What's the future of work?</strong> — "In the future, I think... Jobs will... The economy will..."</li>
<li><strong>Should university education be free?</strong> — "I believe... Because... The counterargument is..."</li>
<li><strong>How do cultural differences affect communication?</strong> — "Different cultures... For example... I think cultural awareness..."</li>
</ul>
<h2>Tips for Better Conversations</h2><p>Pick a topic before you start your <a href="/how-it-works">Chatter3 session</a>. Ask follow-up questions like "Why?" and "How?" to keep the conversation going. Don't worry about grammar mistakes — focus on communicating your ideas. If you're a beginner, check out our <a href="/for-beginners">guide for beginners</a> for more tips.</p>
<h2>Practice Now</h2><p>Pick any topic above and find a conversation partner on Chatter3. Real conversation is the fastest way to improve. If you're worried about speaking, read our guide on <a href="/blog/how-to-overcome-fear-of-speaking-english">how to overcome the fear of speaking English</a>.</p>`},
    {slug:'benefits-of-video-calls-for-language-learning',title:t.blog.articles.videoCallsBenefits.title,excerpt:t.blog.articles.videoCallsBenefits.excerpt,date:'2026-01-05',readTime:'3 min',
     content:`<p>When it comes to language learning, not all practice methods are equal. Video calls offer unique advantages that text chat simply cannot match. Here's why video is the best way to <a href="/blog/how-to-improve-english-speaking">improve your English speaking</a>.</p>
<h2>1. Non-Verbal Communication</h2><p>55% of communication is body language, 38% is tone of voice, and only 7% is words. Video calls let you see and hear your conversation partner, making the interaction more natural and meaningful.</p>
<h2>2. Real-Time Feedback</h2><p>When you make a mistake, your partner can correct you immediately. This instant feedback loop accelerates learning in ways that delayed text corrections can't.</p>
<h2>3. Pronunciation Practice</h2><p>You can hear how words are actually pronounced by real people. Text chat doesn't help you learn the rhythm, stress, and intonation of natural English.</p>
<h2>4. Building Confidence</h2><p>Talking to a real person on video builds confidence faster than typing. It simulates real-world situations like job interviews, meetings, and social events. If you're nervous, our <a href="/blog/how-to-overcome-fear-of-speaking-english">guide to overcoming fear</a> can help.</p>
<h2>5. Emotional Connection</h2><p>Video calls create genuine human connections. When you care about your conversation partner, you're more motivated to learn and practice.</p>
<h2>Try Video Practice Today</h2><p>Chatter3 makes video practice easy and free. <a href="/">Sign up</a> and start your first conversation in minutes. Not sure what to talk about? Check out our <a href="/blog/english-conversation-topics">50 conversation topics</a>.</p>`},
    {slug:'how-to-practice-english-online-for-free',title:t.blog.articles.practiceEnglishFree.title,excerpt:t.blog.articles.practiceEnglishFree.excerpt,date:'2026-02-01',readTime:'5 min',
     content:`<p>Many English learners think improving speaking skills requires expensive tutors or courses. The good news? There are excellent free methods to practice English online. Here's your complete guide.</p>
<h2>1. Language Exchange Platforms</h2><p>Apps like <a href="/how-it-works">Chatter3</a> connect you with other English learners for free 1-on-1 video calls. You practice English while your partner practices your native language — everyone wins.</p>
<h2>2. Watch and Repeat</h2><p>Watch YouTube videos, podcasts, or TV shows in English. Pause after each sentence and repeat it out loud. This builds pronunciation and fluency without any cost.</p>
<h2>3. Talk to Yourself</h2><p>It sounds strange, but narrating your daily activities in English is free practice. Describe what you're cooking, what you see outside, or what you're thinking.</p>
<h2>4. Use Free AI Chatbots</h2><p>AI-powered chatbots can simulate conversation. While not as effective as human interaction, they're available 24/7 and completely free.</p>
<h2>5. Join Online Communities</h2><p>Reddit's r/languagelearning, Discord servers, and Facebook groups have millions of English learners. Participate in voice chats and text discussions.</p>
<h2>6. Record and Review</h2><p>Use your phone's voice recorder to practice speeches or monologues. Listen back and identify areas for improvement. Need topic ideas? Try our <a href="/blog/english-conversation-topics">50 conversation topics</a>.</p>
<h2>Start with Chatter3</h2><p>The most effective free method is real conversation. Chatter3 matches you with practice partners instantly — <a href="/">no subscription needed</a>. New to video practice? Read about the <a href="/blog/benefits-of-video-calls-for-language-learning">benefits of video calls for language learning</a>.</p>`},
    {slug:'best-apps-for-english-conversation-practice',title:t.blog.articles.bestAppsForConversation.title,excerpt:t.blog.articles.bestAppsForConversation.excerpt,date:'2026-02-05',readTime:'6 min',
     content:`<p>With hundreds of English learning apps available, choosing the right one for conversation practice can be overwhelming. Here's an honest comparison of the best options for <a href="/blog/how-to-practice-english-online-for-free">free English practice</a>.</p>
<h2>Chatter3 — Best for Free Video Practice</h2><p>Chatter3 offers free 1-on-1 video calls with real English learners worldwide. No subscription required. The reward points system keeps you motivated, and the matching algorithm pairs you with compatible partners. Learn <a href="/how-it-works">how Chatter3 works</a>.</p>
<h2>italki — Best for Professional Tutors</h2><p>italki connects you with professional English tutors for paid lessons. Great for structured learning, but costs $8-25 per hour. See our <a href="/blog/chatter3-vs-italki">detailed comparison</a>.</p>
<h2>Cambly — Best for Native Speaker Access</h2><p>Cambly provides on-demand video chats with native English speakers. Monthly subscription required ($12-30/month). Read our <a href="/blog/chatter3-vs-cambly">Chatter3 vs Cambly comparison</a>.</p>
<h2>Tandem — Best for Language Exchange</h2><p>Tandem matches you with language exchange partners. Free tier available, but limited features.</p>
<h2>HelloTalk — Best for Text + Voice</h2><p>HelloTalk combines text messaging with voice messages and calls. Good for beginners who aren't ready for live video. Check out our <a href="/for-beginners">beginner's guide</a> for tips on getting started.</p>
<h2>Our Recommendation</h2><p>For pure conversation practice, start with Chatter3's <a href="/">free video calls</a>. As you advance, consider adding a professional tutor on italki for structured feedback. If you need topic ideas, try our <a href="/blog/english-conversation-topics">50 conversation topics</a>.</p>`},
    {slug:'how-to-overcome-fear-of-speaking-english',title:t.blog.articles.overcomeSpeakingFear.title,excerpt:t.blog.articles.overcomeSpeakingFear.excerpt,date:'2026-02-10',readTime:'4 min',
     content:`<p>Fear of speaking is the #1 reason English learners don't improve. You know the grammar, you understand native speakers, but when it's time to speak — your mind goes blank. Here's how to break through.</p>
<h2>1. Understand the Root Cause</h2><p>Fear of speaking usually comes from perfectionism. You're afraid of making mistakes in front of others. But here's the truth: everyone makes mistakes, even native speakers.</p>
<h2>2. Start Small</h2><p>Don't jump into a group conversation. Start by talking to yourself, then practice with a friend, then join a small group. Gradual exposure builds confidence. Our <a href="/for-beginners">beginner's guide</a> has tips for your first conversations.</p>
<h2>3. Embrace Mistakes</h2><p>Every mistake is a learning opportunity. The best English speakers in the world made thousands of mistakes to get there. Reframe errors as progress.</p>
<h2>4. Practice with Supportive Partners</h2><p>Platforms like <a href="/how-it-works">Chatter3</a> match you with fellow learners who understand the struggle. Everyone is there to practice, not to judge.</p>
<h2>5. Set Realistic Goals</h2><p>Don't aim for perfection. Aim for communication. If your message gets across, you've succeeded — even with grammar mistakes.</p>
<h2>6. Celebrate Small Wins</h2><p>Had a 5-minute conversation without freezing? That's a win. Understanding a joke in English? That's a win. Celebrate progress, not perfection.</p>
<h2>Take the First Step</h2><p><a href="/">Join Chatter3 today</a>. Your first conversation partner is waiting, and they're just as nervous as you are. Need topic ideas? Try our <a href="/blog/english-conversation-topics">50 conversation topics</a> to get started.</p>`},
    {slug:'chatter3-vs-italki',title:t.blog.articles.chatter3VsItalki.title,excerpt:t.blog.articles.chatter3VsItalki.excerpt,date:'2026-02-15',readTime:'5 min',
     content:`<p>Choosing between Chatter3 and italki depends on your goals, budget, and learning style. Here's an honest comparison to help you decide.</p>
<h2>Chatter3: Free Video Practice</h2><p>Chatter3 connects you with fellow English learners for free 1-on-1 video calls. There's no subscription fee — the more you practice, the more Reward Points you earn, which can be converted into tokens for premium features.</p>
<h3>Pros:</h3><ul><li>Completely free to use</li><li>Practice with real learners worldwide</li><li>Reward points keep you motivated</li><li>No scheduling required — instant matching</li></ul>
<h3>Cons:</h3><ul><li>Partners are learners, not professional teachers</li><li>No structured curriculum</li><li>Limited advanced features</li></ul>
<h2>italki: Professional Tutoring</h2><p>italki connects you with professional English tutors for paid lessons. Prices range from $8-25 per hour depending on the tutor.</p>
<h3>Pros:</h3><ul><li>Professional, certified teachers</li><li>Structured lesson plans</li><li>Personalized feedback</li><li>Wide range of teaching styles</li></ul>
<h3>Cons:</h3><ul><li>Costs $8-25 per hour</li><li>Requires scheduling in advance</li><li>Less spontaneous practice</li></ul>
<h2>Which Should You Choose?</h2><p><strong>Choose Chatter3 if:</strong> You want free, spontaneous practice and don't need structured lessons.</p>
<p><strong>Choose italki if:</strong> You need professional feedback, have a budget, and prefer structured learning.</p>
<p><strong>Best strategy:</strong> Use Chatter3 for daily free practice and italki weekly for professional feedback.</p>`},
    {slug:'chatter3-vs-cambly',title:t.blog.articles.chatter3VsCambly.title,excerpt:t.blog.articles.chatter3VsCambly.excerpt,date:'2026-02-20',readTime:'4 min',
     content:`<p>Cambly is a popular paid platform for English video practice. But is it worth the subscription when free alternatives like Chatter3 exist? Let's compare.</p>
<h2>Chatter3 vs Cambly: Key Differences</h2>
<h2>Price</h2><p><strong>Chatter3:</strong> Completely free. The more you practice, the more Reward Points you earn — which can be converted into tokens for premium features.</p><p><strong>Cambly:</strong> $12-30/month subscription required.</p>
<h2>Practice Partners</h2><p><strong>Chatter3:</strong> Fellow English learners from around the world.</p><p><strong>Cambly:</strong> Native English speakers (tutors and conversation partners).</p>
<h2>Scheduling</h2><p><strong>Chatter3:</strong> Instant matching — no scheduling needed.</p><p><strong>Cambly:</strong> Can schedule sessions or use on-demand (wait times vary).</p>
<h2>Quality of Practice</h2><p><strong>Chatter3:</strong> Equal practice — both partners are learning, creating a supportive environment.</p><p><strong>Cambly:</strong> One-sided — you practice with a native speaker who corrects you.</p>
<h2>Motivation System</h2><p><strong>Chatter3:</strong> Reward points, streaks, and leaderboards keep you engaged.</p><p><strong>Cambly:</strong> Progress tracking but no gamification.</p>
<h2>Who Should Use Chatter3?</h2><p>Beginners who want free, low-pressure practice. Learners who enjoy helping others while practicing. Anyone who wants to earn Reward Points by practicing — the more you practice, the more you earn.</p>
<h2>Who Should Use Cambly?</h2><p>Intermediate/advanced learners who need native speaker feedback. Professionals preparing for interviews. Learners who prefer structured sessions.</p>
<h2>Our Verdict</h2><p>Chatter3 is free and rewards you for practicing — the more you practice, the more Reward Points you earn. Use Cambly if you specifically need native speaker feedback and can afford the subscription.</p>`}
  ];
}

export default function BlogPage({lang='en'}){
  const t=getTranslations(lang);
  const prefix=lang==='en'?'':`/${lang}`;
  const canonical=`https://app.chatter3.com${prefix}/blog`;
  const hardcoded=getBlogArticles(t);
  const[dynamic,setDynamic]=useState([]);
  useEffect(()=>{
    fetch(`https://api.chatter3.com/api/blog/list?lang=${lang}`).then(r=>r.json()).then(d=>{
      if(d.success&&d.posts?.length){
        setDynamic(d.posts.map(p=>({slug:p.slug,title:p.title,excerpt:p.excerpt,content:p.content,date:p.created_at?.slice(0,10),readTime:Math.max(1,Math.ceil((p.content||'').split(/\s+/).length/200))+' min'})));
      }
    }).catch(()=>{});
  },[lang]);
  const articles=[...dynamic,...hardcoded.filter(h=>!dynamic.find(d=>d.slug===h.slug))];
  return(
    <div className="lp">
      <SEOHead title={t.meta.blog.title} description={t.meta.blog.description} canonical={canonical} lang={lang}/>
      <nav className="lp-nav"><div className="lp-nav-inner"><a href={`${prefix}/`} className="lp-nav-logo"><img src="/chatter3_logo.png" alt="Chatter3"/></a><div className="lp-nav-links"><a href={`${prefix}/`}>{t.nav.home}</a><a href={`${prefix}/how-it-works`}>{t.nav.howItWorks}</a><a href={`${prefix}/for-beginners`}>{t.nav.forBeginners}</a><a href={`${prefix}/blog`} className="active">{t.nav.blog}</a><a href={`${prefix}/faq`}>{t.nav.faq||'FAQ'}</a></div><LanguageSwitcher currentLang={lang} isLandingPage/><a href="/" className="lp-cta">{t.nav.getStarted}</a></div></nav>
      <div className="lp-hero">
        <h1>{t.blog.title}</h1>
        <p>{t.blog.subtitle}</p>
      </div>
      <div className="lp-section">
        <h2 style={{fontSize:'1.5rem',fontWeight:800,marginBottom:'1.5rem'}}>{t.blog.latestArticles}</h2>
        {articles.map((a,i)=>(
          <a key={i} href={`${prefix}/blog/${a.slug}`} style={{display:'block',background:'white',borderRadius:12,padding:'1.5rem',marginBottom:'1rem',cursor:'pointer',border:'1px solid #e5e7eb',transition:'box-shadow .2s',textDecoration:'none',color:'inherit'}} onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,.08)'} onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
            <h3 style={{margin:'0 0 .5rem',fontSize:'1.2rem',fontWeight:700,color:'#1a1a2e'}}>{a.title}</h3>
            <p style={{margin:'0 0 .5rem',color:'#6b7280',fontSize:'.9rem'}}>{a.excerpt}</p>
            <span style={{color:'#6366f1',fontSize:'.85rem',fontWeight:600}}>{t.blog.readMore}</span>
          </a>
        ))}
      </div>
      <div className="lp-cta-bottom">
        <h2>{t.blog.bottomTitle}</h2>
        <p style={{color:'rgba(255,255,255,.8)',marginBottom:'1.5rem',fontSize:'1.05rem'}}>{t.blog.bottomSubtitle}</p>
        <a href="/" className="lp-cta">{t.blog.bottomCta}</a>
      </div>
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-links">
            <a href={`${prefix}/`}>{t.nav.home}</a>
            <a href={`${prefix}/how-it-works`}>{t.nav.howItWorks}</a>
            <a href={`${prefix}/for-beginners`}>{t.nav.forBeginners}</a>
            <a href={`${prefix}/blog`}>{t.nav.blog}</a>
            <a href={`${prefix}/faq`}>{t.nav.faq||'FAQ'}</a>
            <a href="https://chatter3.com" target="_blank">Chatter3.com</a>
          </div>
          <p>{t.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
