"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const ROUTES = {
  "array":"/array","linked-list":"/linked-list","stack":"/stack","queue":"/queue",
  "binary-tree":"/tree","bst":"/tree","avl":"/tree","heap":"/tree","trie":"/tree",
  "graph":"/graph","adj-list":"/graph","adj-matrix":"/graph",
  "directed":"/graph","undirected":"/graph","weighted":"/graph","unweighted":"/graph",
  "hash-map":"/hash-map","hash-set":"/hash-set",
  "bubble":"/bubble-sort","insertion":"/insertion-sort","merge":"/merge-sort",
  "quick":"/quick-sort","heap-sort":"/heap-sort","radix":"/radix-sort",
  "linear-s":"/linear-search","binary-s":"/binary-search",
  "bfs":"/bfs","dfs":"/dfs","dijkstra":"/dijkstra","bellman":"/bellman-ford",
  "kruskal":"/kruskal","prim":"/prim",
  "fibonacci":"/fibonacci","knapsack":"/knapsack","lcs":"/lcs","lis":"/lis",
};

const TREE = {
  ds:{
    label:"Data Structures",accent:"#818cf8",glow:"rgba(129,140,248,0.45)",
    description:"Foundational structures that organise and store data efficiently.",
    categories:[
      {id:"linear",label:"Linear",color:"#818cf8",icon:"▤",desc:"Sequential memory layout",items:[
        {id:"array",label:"Array",icon:"[ ]",complexity:"O(1)",tag:"Basic",desc:"Indexed collection"},
        {id:"linked-list",label:"Linked List",icon:"→",complexity:"O(n)",tag:"Basic",desc:"Node chain"},
        {id:"stack",label:"Stack",icon:"⬆",complexity:"O(1)",tag:"Basic",desc:"LIFO structure"},
        {id:"queue",label:"Queue",icon:"⇥",complexity:"O(1)",tag:"Basic",desc:"FIFO structure"},
      ]},
      {id:"trees",label:"Trees",color:"#a78bfa",icon:"⑂",desc:"Hierarchical node structures",items:[
        {id:"binary-tree",label:"Binary Tree",icon:"⑂",complexity:"O(log n)",tag:"Mid",desc:"Two children max"},
        {id:"bst",label:"BST",icon:"⑂",complexity:"O(log n)",tag:"Mid",desc:"Ordered binary tree"},
        {id:"avl",label:"AVL Tree",icon:"⑂",complexity:"O(log n)",tag:"Hard",desc:"Self-balancing BST"},
        {id:"heap",label:"Heap",icon:"△",complexity:"O(log n)",tag:"Mid",desc:"Priority ordering"},
        {id:"trie",label:"Trie",icon:"⑂",complexity:"O(m)",tag:"Hard",desc:"Prefix tree"},
      ]},
      {id:"graphs",label:"Graphs",color:"#c084fc",icon:"◎",desc:"Vertices connected by edges",items:[
        {id:"graph",label:"Graph",icon:"◎",complexity:"O(V+E)",tag:"Hard",desc:"General graph"},
        {id:"adj-list",label:"Adj. List",icon:"≡",complexity:"O(V+E)",tag:"Mid",desc:"Sparse representation"},
        {id:"adj-matrix",label:"Adj. Matrix",icon:"⊞",complexity:"O(V²)",tag:"Mid",desc:"Dense representation"},
        {id:"directed",label:"Directed",icon:"→",complexity:"O(V+E)",tag:"Mid",desc:"One-way edges"},
        {id:"undirected",label:"Undirected",icon:"↔",complexity:"O(V+E)",tag:"Basic",desc:"Bidirectional edges"},
        {id:"weighted",label:"Weighted",icon:"⚖",complexity:"O(V+E)",tag:"Mid",desc:"Edge cost/distance"},
        {id:"unweighted",label:"Unweighted",icon:"⊙",complexity:"O(V+E)",tag:"Basic",desc:"Equal-cost edges"},
      ]},
      {id:"hashing",label:"Hashing",color:"#e879f9",icon:"#",desc:"O(1) key-value lookup",items:[
        {id:"hash-map",label:"Hash Map",icon:"{}",complexity:"O(1)",tag:"Mid",desc:"Key-value store"},
        {id:"hash-set",label:"Hash Set",icon:"∅",complexity:"O(1)",tag:"Mid",desc:"Unique values"},
      ]},
    ],
  },
  algo:{
    label:"Algorithms",accent:"#22d3ee",glow:"rgba(34,211,238,0.45)",
    description:"Step-by-step procedures that solve computational problems.",
    categories:[
      {id:"sorting",label:"Sorting",color:"#22d3ee",icon:"↕",desc:"Arrange elements in order",items:[
        {id:"bubble",label:"Bubble Sort",icon:"○",complexity:"O(n²)",tag:"Basic",desc:"Adjacent swaps"},
        {id:"insertion",label:"Insertion Sort",icon:"↩",complexity:"O(n²)",tag:"Basic",desc:"Build sorted array"},
        {id:"merge",label:"Merge Sort",icon:"⊕",complexity:"O(n log n)",tag:"Mid",desc:"Divide and merge"},
        {id:"quick",label:"Quick Sort",icon:"⚡",complexity:"O(n log n)",tag:"Mid",desc:"Partition pivot"},
        {id:"heap-sort",label:"Heap Sort",icon:"△",complexity:"O(n log n)",tag:"Mid",desc:"Heap-based sort"},
        {id:"radix",label:"Radix Sort",icon:"⌗",complexity:"O(nk)",tag:"Hard",desc:"Digit-by-digit"},
      ]},
      {id:"searching",label:"Searching",color:"#2dd4bf",icon:"◉",desc:"Locate elements in data",items:[
        {id:"linear-s",label:"Linear Search",icon:"→",complexity:"O(n)",tag:"Basic",desc:"Sequential scan"},
        {id:"binary-s",label:"Binary Search",icon:"⟨⟩",complexity:"O(log n)",tag:"Basic",desc:"Halving search"},
      ]},
      {id:"graph-a",label:"Graph Algos",color:"#34d399",icon:"⬡",desc:"Traverse and analyse graphs",items:[
        {id:"bfs",label:"BFS",icon:"⊙",complexity:"O(V+E)",tag:"Mid",desc:"Level-order traversal"},
        {id:"dfs",label:"DFS",icon:"⬇",complexity:"O(V+E)",tag:"Mid",desc:"Depth traversal"},
        {id:"dijkstra",label:"Dijkstra",icon:"⬡",complexity:"O(E log V)",tag:"Hard",desc:"Shortest path"},
        {id:"bellman",label:"Bellman-Ford",icon:"⊕",complexity:"O(VE)",tag:"Hard",desc:"Negative weights"},
        {id:"kruskal",label:"Kruskal",icon:"⑂",complexity:"O(E log E)",tag:"Hard",desc:"Minimum span tree"},
        {id:"prim",label:"Prim's",icon:"◈",complexity:"O(E log V)",tag:"Hard",desc:"Greedy MST"},
      ]},
      {id:"dp",label:"Dynamic Prog.",color:"#86efac",icon:"⊞",desc:"Memoised subproblem solving",items:[
        {id:"fibonacci",label:"Fibonacci",icon:"∞",complexity:"O(n)",tag:"Mid",desc:"Classic DP example"},
        {id:"knapsack",label:"Knapsack",icon:"⊡",complexity:"O(nW)",tag:"Hard",desc:"Weight optimisation"},
        {id:"lcs",label:"LCS",icon:"≈",complexity:"O(mn)",tag:"Hard",desc:"Common subsequence"},
        {id:"lis",label:"LIS",icon:"↑",complexity:"O(n²)",tag:"Hard",desc:"Increasing subsequence"},
      ]},
    ],
  },
};

const TAG={
  Basic:{bg:"rgba(99,102,241,0.12)",text:"#a5b4fc",border:"rgba(99,102,241,0.22)"},
  Mid:{bg:"rgba(6,182,212,0.12)",text:"#67e8f9",border:"rgba(6,182,212,0.22)"},
  Hard:{bg:"rgba(239,68,68,0.12)",text:"#fca5a5",border:"rgba(239,68,68,0.22)"},
};

function useIsMobile(bp=768){
  const[m,setM]=useState(false);
  useEffect(()=>{const c=()=>setM(window.innerWidth<=bp);c();window.addEventListener("resize",c);return()=>window.removeEventListener("resize",c);},[bp]);
  return m;
}

// ─── SCROLL DIRECTION ───────────────────────────────────────────────────────
function useScrollDir(){
  const[dir,setDir]=useState("down");
  const last=useRef(0);
  useEffect(()=>{
    const fn=()=>{
      const y=window.scrollY;
      setDir(y>last.current?"down":"up");
      last.current=y;
    };
    window.addEventListener("scroll",fn,{passive:true});
    return()=>window.removeEventListener("scroll",fn);
  },[]);
  return dir;
}

// ─── LENIS + GSAP ────────────────────────────────────────────────────────────
function useLenis(){
  const ref=useRef(null);
  useEffect(()=>{
    let lenis,gsapTicker,gsapLib,ST;
    const init=async()=>{
      try{
        const[LM,GM,STM]=await Promise.all([
          import("@studio-freight/lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        const Lenis=LM.default;
        gsapLib=GM.gsap||GM.default;
        ST=STM.ScrollTrigger;
        gsapLib.registerPlugin(ST);
        gsapLib.ticker.lagSmoothing(0);

        lenis=new Lenis({
          duration:1.4,
          easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),
          orientation:"vertical",
          smoothWheel:true,
          wheelMultiplier:0.85,
          smoothTouch:false,
          touchMultiplier:1.6,
          infinite:false,
          autoRaf:false,
        });
        ref.current=lenis;
        gsapTicker=(time)=>lenis.raf(time*1000);
        gsapLib.ticker.add(gsapTicker);
        lenis.on("scroll",ST.update);
        ST.scrollerProxy(document.documentElement,{
          scrollTop(v){
            if(arguments.length&&lenis)lenis.scrollTo(v,{immediate:true,force:true});
            return lenis?lenis.scroll:window.scrollY;
          },
          getBoundingClientRect(){return{top:0,left:0,width:window.innerWidth,height:window.innerHeight};},
          pinType:document.documentElement.style.transform?"transform":"fixed",
        });
        ST.addEventListener("refresh",()=>lenis&&lenis.resize());
        ST.refresh();
        wireAnimations(gsapLib,ST);
      }catch(e){wireAnimationsNative();}
    };
    init();
    return()=>{
      if(lenis){lenis.destroy();ref.current=null;}
      if(gsapLib&&gsapTicker)gsapLib.ticker.remove(gsapTicker);
    };
  },[]);
  return ref;
}

function wireAnimations(gsap,ScrollTrigger){
  // NAV
  gsap.fromTo(".vs-nav",
    {y:-100,opacity:0},
    {y:0,opacity:1,duration:1.4,ease:"expo.out",delay:.05});

  // HERO — staggered cinematic reveal
  const tl=gsap.timeline({delay:.15});

  tl.fromTo(".hero-badge",
      {y:50,opacity:0,scale:.75,rotationX:40},
      {y:0,opacity:1,scale:1,rotationX:0,duration:0,ease:"expo.out",transformPerspective:800})
    .fromTo(".hero-eyebrow",
      {opacity:0,y:22,letterSpacing:"1.2em"},
      {opacity:1,y:0,letterSpacing:".22em",duration:1,ease:"power3.out"},"-=.5")
    // LINE 1 — "See the code."
    .fromTo(".hero-line1",
      {opacity:0,y:120,skewY:8,rotationX:30,transformPerspective:1000,filter:"blur(12px)"},
      {opacity:1,y:0,skewY:0,rotationX:0,filter:"blur(0px)",duration:1.5,ease:"expo.out"},"-=.55")
    // LINE 2 — "Feel the logic."
    .fromTo(".hero-line2",
      {opacity:0,y:120,skewY:8,rotationX:30,transformPerspective:1000,filter:"blur(12px)"},
      {opacity:1,y:0,skewY:0,rotationX:0,filter:"blur(0px)",duration:1.5,ease:"expo.out"},"-=1.1")
    .fromTo(".hero-sub",
      {y:55,opacity:0,filter:"blur(8px)"},
      {y:0,opacity:1,filter:"blur(0px)",duration:1,ease:"power3.out"},"-=.65")
    .fromTo(".btn-primary",
      {y:40,opacity:0,scale:.88},
      {y:0,opacity:1,scale:1,duration:.8,ease:"back.out(2.2)"},"-=.5")
    .fromTo(".btn-secondary",
      {y:40,opacity:0,scale:.88},
      {y:0,opacity:1,scale:1,duration:.8,ease:"back.out(2.2)"},"-=.62")
    .fromTo(".hero-scroll-hint",
      {opacity:0,y:14},
      {opacity:.45,y:0,duration:1.2},"-=.3");

  // HERO parallax meshes
  gsap.to(".hero-mesh-1",{y:-220,ease:"none",
    scrollTrigger:{trigger:".hero-section",start:"top top",end:"bottom top",scrub:2.5}});
  gsap.to(".hero-mesh-2",{y:-140,x:60,ease:"none",
    scrollTrigger:{trigger:".hero-section",start:"top top",end:"bottom top",scrub:3.2}});
  gsap.to(".hero-mesh-3",{y:-90,x:-40,ease:"none",
    scrollTrigger:{trigger:".hero-section",start:"top top",end:"bottom top",scrub:1.8}});

  // HERO text content — parallax scroll away (creates depth)
  gsap.to(".hero-content-wrap",{
    y:-80,opacity:.0,filter:"blur(6px)",ease:"none",
    scrollTrigger:{trigger:".hero-section",start:"top top",end:"60% top",scrub:1.4}
  });

  // HR LINES
  gsap.utils.toArray(".hr-line").forEach(el=>{
    gsap.fromTo(el,
      {scaleX:0,opacity:0,transformOrigin:"left center"},
      {scaleX:1,opacity:1,duration:2,ease:"expo.out",
       scrollTrigger:{trigger:el,start:"top 98%",toggleActions:"play none none reverse"}});
  });

  // STATS — 3D cascade
  gsap.utils.toArray(".stat-card").forEach((el,i)=>{
    gsap.fromTo(el,
      {opacity:0,y:80,rotateY:30,rotateX:15,scale:.8,transformPerspective:800},
      {opacity:1,y:0,rotateY:0,rotateX:0,scale:1,duration:1.1,ease:"expo.out",
       delay:i*.12,
       scrollTrigger:{trigger:el,start:"top 90%",toggleActions:"play none none reverse"}});
  });

  // SECTION LABELS — letter-spacing morph
  gsap.utils.toArray(".section-label").forEach(el=>{
    gsap.fromTo(el,
      {opacity:0,y:20,letterSpacing:"0.7em"},
      {opacity:1,y:0,letterSpacing:".16em",duration:1.2,ease:"power3.out",
       scrollTrigger:{trigger:el,start:"top 88%",toggleActions:"play none none reverse"}});
  });

  // SECTION HEADINGS — clip + blur reveal
  gsap.utils.toArray(".section-heading").forEach(el=>{
    gsap.fromTo(el,
      {opacity:0,y:80,skewY:4,filter:"blur(14px)",clipPath:"inset(100% 0 0 0)"},
      {opacity:1,y:0,skewY:0,filter:"blur(0px)",clipPath:"inset(0% 0 0 0)",duration:1.4,ease:"expo.out",
       scrollTrigger:{trigger:el,start:"top 88%",toggleActions:"play none none reverse"}});
  });

  // FEATURE CARDS — cinematic stagger with 3D flip
  gsap.utils.toArray(".feat-card").forEach((el,i)=>{
    gsap.fromTo(el,
      {opacity:0,y:100,rotateX:28,scale:.88,transformPerspective:900,transformOrigin:"50% 0%",filter:"blur(8px)"},
      {opacity:1,y:0,rotateX:0,scale:1,filter:"blur(0px)",duration:1.2,ease:"expo.out",
       delay:(i%3)*.14,
       scrollTrigger:{trigger:el,start:"top 92%",toggleActions:"play none none reverse"}});
  });

  // EXPLORER PANEL — iris blur reveal
  gsap.fromTo(".explorer-panel",
    {opacity:0,y:110,scale:.9,filter:"blur(22px)",rotateX:12,transformPerspective:1200},
    {opacity:1,y:0,scale:1,filter:"blur(0px)",rotateX:0,duration:1.8,ease:"expo.out",
     scrollTrigger:{trigger:".explorer-panel",start:"top 85%",toggleActions:"play none none reverse"}});

  // CTA
  gsap.fromTo(".cta-inner",
    {opacity:0,y:90,scale:.88,filter:"blur(18px)"},
    {opacity:1,y:0,scale:1,filter:"blur(0px)",duration:1.5,ease:"expo.out",
     scrollTrigger:{trigger:".cta-inner",start:"top 85%",toggleActions:"play none none reverse"}});

  gsap.fromTo(".cta-h2",
    {opacity:0,y:60,skewY:3,filter:"blur(8px)"},
    {opacity:1,y:0,skewY:0,filter:"blur(0px)",duration:1.3,ease:"expo.out",
     scrollTrigger:{trigger:".cta-h2",start:"top 88%",toggleActions:"play none none reverse"}});

  // LEGEND DOTS
  gsap.utils.toArray(".legend-dot").forEach((el,i)=>{
    gsap.fromTo(el,
      {opacity:0,scale:0,y:18},
      {opacity:1,scale:1,y:0,duration:.8,ease:"back.out(2.5)",delay:i*.15,
       scrollTrigger:{trigger:el,start:"top 97%",toggleActions:"play none none reverse"}});
  });

  // FOOTER
  gsap.fromTo("footer",
    {opacity:0,y:50,filter:"blur(6px)"},
    {opacity:1,y:0,filter:"blur(0px)",duration:1.2,ease:"power3.out",
     scrollTrigger:{trigger:"footer",start:"top 97%",toggleActions:"play none none reverse"}});

  // AMB ORBS parallax
  gsap.utils.toArray(".amb-orb").forEach((el,i)=>{
    gsap.to(el,{y:-90*(i+1),ease:"none",
      scrollTrigger:{trigger:"body",start:"top top",end:"bottom bottom",scrub:3+i*.6}});
  });

  ScrollTrigger.refresh();
}

function wireAnimationsNative(){
  document.querySelectorAll(
    ".vs-nav,.hero-badge,.hero-eyebrow,.hero-line1,.hero-line2,.hero-sub,.btn-primary,.btn-secondary,.hero-scroll-hint,.stat-card,.feat-card,.explorer-panel,.cta-inner,.cta-h2,.section-label,.section-heading,footer,.hr-line,.legend-dot"
  ).forEach(el=>{el.style.opacity="1";el.style.transform="none";el.style.filter="none";el.style.clipPath="none";});
}

// ─── PARTICLE CANVAS ─────────────────────────────────────────────────────────
function ParticleCanvas(){
  const ref=useRef(null),anim=useRef(null);
  useEffect(()=>{
    const c=ref.current,ctx=c.getContext("2d");
    const resize=()=>{c.width=window.innerWidth;c.height=window.innerHeight;};
    resize();window.addEventListener("resize",resize);
    const n=window.innerWidth<768?22:48;
    const pts=Array.from({length:n},()=>({
      x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,
      r:Math.random()*1.6+.2,vx:(Math.random()-.5)*.07,vy:(Math.random()-.5)*.07,
      a:Math.random()*.12+.025,hue:Math.random()>0.5?245:195,
    }));
    const draw=()=>{
      ctx.clearRect(0,0,c.width,c.height);
      for(let i=0;i<pts.length;i++){
        const p=pts[i];p.x+=p.vx;p.y+=p.vy;
        if(p.x<0)p.x=c.width;if(p.x>c.width)p.x=0;
        if(p.y<0)p.y=c.height;if(p.y>c.height)p.y=0;
        ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`hsla(${p.hue},85%,75%,${p.a})`;ctx.fill();
        for(let j=i+1;j<pts.length;j++){
          const q=pts[j],d=Math.hypot(p.x-q.x,p.y-q.y);
          if(d<120){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);
            ctx.strokeStyle=`hsla(${p.hue},85%,75%,${.022*(1-d/120)})`;ctx.lineWidth=.4;ctx.stroke();}
        }
      }
      anim.current=requestAnimationFrame(draw);
    };
    draw();
    return()=>{cancelAnimationFrame(anim.current);window.removeEventListener("resize",resize);};
  },[]);
  return <canvas ref={ref} style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0}}/>;
}

// ─── PREMIUM LOGO ─────────────────────────────────────────────────────────────
function PremiumLogo({size="md"}){
  const isLg=size==="lg",bs=isLg?54:44,fs=isLg?"clamp(18px,2vw,24px)":"clamp(15px,1.6vw,20px)",ms=isLg?"17px":"14px";
  return(
    <div style={{display:"flex",alignItems:"center",gap:"13px",cursor:"default",userSelect:"none"}}>
      <div style={{position:"relative",width:`${bs}px`,height:`${bs}px`,flexShrink:0}}>
        <div style={{position:"absolute",inset:"-10px",borderRadius:"18px",background:"radial-gradient(ellipse at 50% 50%,rgba(129,140,248,.42) 0%,rgba(167,139,250,.2) 45%,transparent 75%)",filter:"blur(10px)",animation:"logoPulse 3.8s ease-in-out infinite"}}/>
        <div style={{position:"absolute",inset:"-1.5px",borderRadius:"13px",background:"linear-gradient(135deg,#818cf8,#c084fc,#22d3ee,#818cf8)",backgroundSize:"300% 300%",animation:"borderSpin 4s linear infinite",opacity:.92}}/>
        <div style={{position:"absolute",inset:"1.5px",borderRadius:"11.5px",background:"linear-gradient(155deg,#0e0e2e 0%,#080818 55%,#0c0c25 100%)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
          <div style={{position:"absolute",top:"-20%",left:"-80%",width:"55%",height:"140%",background:"linear-gradient(105deg,transparent,rgba(255,255,255,.1),transparent)",transform:"skewX(-15deg)",animation:"badgeSweep 3.2s ease-in-out infinite"}}/>
          <span style={{fontFamily:"'Space Mono',monospace",fontSize:ms,fontWeight:700,letterSpacing:"-.03em",background:"linear-gradient(145deg,#e0e7ff 0%,#a5b4fc 35%,#c084fc 65%,#67e8f9 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",position:"relative",zIndex:1,filter:"drop-shadow(0 0 8px rgba(129,140,248,.7))"}}>VS</span>
        </div>
      </div>
      <div style={{lineHeight:1}}>
        <div style={{display:"flex",alignItems:"baseline"}}>
          <span style={{fontFamily:"'Space Mono',monospace",fontSize:fs,fontWeight:700,letterSpacing:".02em",color:"#dde4ff",lineHeight:1.4}}>Visuo</span>
          <span style={{fontFamily:"'Space Mono',monospace",fontSize:fs,fontWeight:700,letterSpacing:".02em",background:"linear-gradient(90deg,#818cf8 0%,#a78bfa 22%,#e879f9 44%,#22d3ee 66%,#a78bfa 88%,#818cf8 100%)",backgroundSize:"250% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",animation:"shimmer 3.6s linear infinite",display:"inline-block",lineHeight:1.4,paddingBottom:".2em",marginBottom:"-.2em"}}>Slayer</span>
        </div>
        <div style={{height:"1px",marginTop:"4px",background:"linear-gradient(to right,rgba(129,140,248,.55),rgba(34,211,238,.35),transparent)"}}/>
      </div>
    </div>
  );
}

// ─── TOPIC CARD ───────────────────────────────────────────────────────────────
function TopicCard({item,catColor,onLeafClick,animDelay}){
  const[hov,setHov]=useState(false);
  const tc=TAG[item.tag]||TAG.Basic;
  return(
    <div onClick={()=>onLeafClick(item)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{position:"relative",padding:"14px",borderRadius:"13px",cursor:"pointer",overflow:"hidden",
        background:hov?`${catColor}0f`:"rgba(255,255,255,.03)",
        border:`1px solid ${hov?catColor+"55":"rgba(255,255,255,.07)"}`,
        boxShadow:hov?`0 8px 32px ${catColor}20,inset 0 1px 0 rgba(255,255,255,.07)`:"inset 0 1px 0 rgba(255,255,255,.03)",
        transition:"all .26s cubic-bezier(.16,1,.3,1)",
        transform:hov?"translateY(-6px) scale(1.04)":"translateY(0) scale(1)",
        animation:`itemFade .28s ${animDelay}ms both ease-out`}}>
      {hov&&<div style={{position:"absolute",top:"-30%",left:"15%",width:"90px",height:"90px",borderRadius:"50%",background:`radial-gradient(circle,${catColor}28,transparent 70%)`,filter:"blur(14px)",pointerEvents:"none"}}/>}
      <div style={{display:"flex",alignItems:"flex-start",gap:"10px",marginBottom:"10px"}}>
        <span style={{width:"32px",height:"32px",borderRadius:"9px",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontFamily:"'Space Mono',monospace",color:catColor,background:hov?`${catColor}28`:`${catColor}14`,border:`1px solid ${hov?catColor+"55":catColor+"22"}`,transition:"all .22s",boxShadow:hov?`0 0 14px ${catColor}40`:"none"}}>{item.icon}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:"13px",fontWeight:700,lineHeight:1.2,color:hov?"#f1f5f9":"#cbd5e1",transition:"color .18s",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.label}</div>
          <div style={{fontSize:"10px",color:"#4b5563",lineHeight:1.3,marginTop:"2px"}}>{item.desc}</div>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <code style={{fontSize:"9px",fontFamily:"'Space Mono',monospace",color:hov?catColor:"#374151",background:hov?`${catColor}14`:"rgba(255,255,255,.04)",padding:"2px 7px",borderRadius:"5px",border:`1px solid ${hov?catColor+"30":"rgba(255,255,255,.06)"}`,transition:"all .18s"}}>{item.complexity}</code>
        <span style={{fontSize:"8px",fontWeight:700,letterSpacing:".05em",padding:"2px 7px",borderRadius:"5px",background:tc.bg,color:tc.text,border:`1px solid ${tc.border}`}}>{item.tag}</span>
      </div>
      {hov&&<div style={{position:"absolute",bottom:0,left:0,right:0,height:"2px",background:`linear-gradient(to right,transparent,${catColor}90,transparent)`,borderRadius:"0 0 13px 13px"}}/>}
    </div>
  );
}

// ─── DSA EXPLORER ─────────────────────────────────────────────────────────────
function DSAExplorer({onLeafClick}){
  const[tabId,setTabId]=useState("ds");
  const[catId,setCatId]=useState("linear");
  const[fadeIn,setFadeIn]=useState(true);
  const isMobile=useIsMobile(700);
  const tab=TREE[tabId];
  const cat=tab.categories.find(c=>c.id===catId)||tab.categories[0];
  const switchTab=id=>{if(id===tabId)return;setFadeIn(false);setTimeout(()=>{setTabId(id);setCatId(TREE[id].categories[0].id);setFadeIn(true);},140);};
  const switchCat=id=>{if(id===catId&&!isMobile)return;setFadeIn(false);setTimeout(()=>{setCatId(id);setFadeIn(true);},100);};
  const cols=cat.items.length<=4?2:3;
  return(
    <div style={{width:"100%",fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:"22px"}}>
        <div style={{display:"flex",gap:"4px",padding:"5px",borderRadius:"16px",background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",backdropFilter:"blur(8px)"}}>
          {Object.entries(TREE).map(([id,t])=>{const active=tabId===id;return(
            <button key={id} onClick={()=>switchTab(id)} style={{display:"flex",alignItems:"center",gap:"7px",padding:isMobile?"8px 16px":"10px 26px",borderRadius:"11px",background:active?`${t.accent}20`:"transparent",border:`1px solid ${active?t.accent+"60":"transparent"}`,color:active?t.accent:"#4b5563",fontSize:isMobile?"12px":"13px",fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .22s cubic-bezier(.16,1,.3,1)",boxShadow:active?`0 2px 20px ${t.glow},inset 0 1px 0 rgba(255,255,255,.07)`:"none",whiteSpace:"nowrap",userSelect:"none"}}>
              <span style={{fontSize:"14px",filter:active?`drop-shadow(0 0 8px ${t.accent})`:"none",transition:"filter .18s"}}>{id==="ds"?"⬡":"⚙"}</span>
              {isMobile?(id==="ds"?"Data Structures":"Algorithms"):t.label}
            </button>);})}
        </div>
      </div>
      {!isMobile&&(
        <div style={{display:"grid",gridTemplateColumns:"210px 1fr",borderRadius:"18px",border:"1px solid rgba(255,255,255,.08)",overflow:"hidden",minHeight:"380px",background:"rgba(4,4,20,.7)"}}>
          <div style={{borderRight:"1px solid rgba(255,255,255,.07)",display:"flex",flexDirection:"column",background:"rgba(0,0,0,.25)"}}>
            <div style={{padding:"18px 16px 14px",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
              <div style={{display:"flex",alignItems:"center",gap:"7px",marginBottom:"7px"}}>
                <span style={{width:"22px",height:"22px",borderRadius:"7px",background:`${tab.accent}20`,border:`1px solid ${tab.accent}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",color:tab.accent}}>{tabId==="ds"?"⬡":"⚙"}</span>
                <span style={{fontSize:"11px",fontWeight:800,color:tab.accent}}>{tab.label}</span>
              </div>
              <p style={{fontSize:"10px",color:"#374151",lineHeight:1.55}}>{tab.description}</p>
            </div>
            <div style={{padding:"8px",flex:1,display:"flex",flexDirection:"column",gap:"2px"}}>
              <div style={{fontSize:"9px",fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:"#1e293b",padding:"4px 8px 8px"}}>Categories</div>
              {tab.categories.map(c=>{const active=catId===c.id;return(
                <button key={c.id} onClick={()=>switchCat(c.id)}
                  style={{display:"flex",alignItems:"center",gap:"9px",padding:"9px 10px",borderRadius:"10px",width:"100%",textAlign:"left",background:active?`${c.color}1c`:"transparent",border:`1px solid ${active?c.color+"40":"transparent"}`,color:active?c.color:"#4b5563",fontSize:"12px",fontWeight:active?700:500,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .16s",userSelect:"none"}}
                  onMouseEnter={e=>{if(!active){e.currentTarget.style.background=`${c.color}0e`;e.currentTarget.style.color=c.color;}}}
                  onMouseLeave={e=>{if(!active){e.currentTarget.style.background="transparent";e.currentTarget.style.color="#4b5563";}}}>
                  <span style={{width:"7px",height:"7px",borderRadius:"50%",flexShrink:0,background:active?c.color:"#1e293b",boxShadow:active?`0 0 7px ${c.color}`:"none",transition:"all .16s"}}/>
                  <span style={{flex:1}}>{c.label}</span>
                  <span style={{fontSize:"9px",fontWeight:700,padding:"1px 6px",borderRadius:"5px",background:active?`${c.color}22`:"rgba(255,255,255,.04)",color:active?c.color:"#374151",border:`1px solid ${active?c.color+"28":"rgba(255,255,255,.05)"}`,transition:"all .16s"}}>{c.items.length}</span>
                </button>);})}
            </div>
            <div style={{padding:"13px 15px",borderTop:"1px solid rgba(255,255,255,.05)"}}>
              <div style={{display:"flex",alignItems:"center",gap:"5px",marginBottom:"3px"}}>
                <span style={{fontSize:"11px",color:cat.color}}>{cat.icon}</span>
                <span style={{fontSize:"11px",fontWeight:700,color:cat.color}}>{cat.label}</span>
              </div>
              <p style={{fontSize:"9px",color:"#374151",lineHeight:1.4}}>{cat.desc}</p>
            </div>
          </div>
          <div style={{padding:"22px",opacity:fadeIn?1:0,transform:fadeIn?"translateY(0)":"translateY(6px)",transition:"opacity .16s,transform .16s",display:"flex",flexDirection:"column"}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"16px",paddingBottom:"14px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:"9px",marginBottom:"4px"}}>
                  <span style={{width:"30px",height:"30px",borderRadius:"9px",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",color:cat.color,background:`${cat.color}1e`,border:`1px solid ${cat.color}32`}}>{cat.icon}</span>
                  <span style={{fontSize:"15px",fontWeight:800,color:"#f1f5f9",letterSpacing:"-.01em"}}>{cat.label}</span>
                  <span style={{fontSize:"10px",color:"#4b5563",background:"rgba(255,255,255,.04)",padding:"2px 8px",borderRadius:"5px",border:"1px solid rgba(255,255,255,.06)"}}>{cat.items.length} topics</span>
                </div>
                <p style={{fontSize:"11px",color:"#4b5563",marginLeft:"39px"}}>{cat.desc}</p>
              </div>
              <div style={{display:"flex",gap:"5px",flexShrink:0}}>
                {["Basic","Mid","Hard"].map(t=>(
                  <span key={t} style={{fontSize:"8px",fontWeight:700,letterSpacing:".05em",padding:"2px 8px",borderRadius:"5px",background:TAG[t].bg,color:TAG[t].text,border:`1px solid ${TAG[t].border}`}}>{t}</span>
                ))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:"9px",flex:1,alignContent:"start"}}>
              {cat.items.map((item,ii)=><TopicCard key={item.id} item={item} catColor={cat.color} onLeafClick={onLeafClick} animDelay={ii*28}/>)}
            </div>
          </div>
        </div>
      )}
      {isMobile&&(
        <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
          {tab.categories.map(c=>{const open=catId===c.id;return(
            <div key={c.id} style={{borderRadius:"14px",border:`1px solid ${open?c.color+"45":"rgba(255,255,255,.07)"}`,overflow:"hidden",transition:"border-color .2s,box-shadow .2s",boxShadow:open?`0 4px 24px ${c.color}16`:"none"}}>
              <button onClick={()=>setCatId(open?"__none":c.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:"11px",padding:"14px",background:open?`${c.color}12`:"rgba(255,255,255,.025)",border:"none",cursor:"pointer",textAlign:"left",fontFamily:"'DM Sans',sans-serif",transition:"background .18s"}}>
                <span style={{width:"30px",height:"30px",borderRadius:"9px",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",color:c.color,background:`${c.color}18`,border:`1px solid ${c.color}28`}}>{c.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:"13px",fontWeight:700,color:open?c.color:"#94a3b8"}}>{c.label}</div>
                  <div style={{fontSize:"10px",color:"#4b5563",marginTop:"2px"}}>{c.desc} · {c.items.length} topics</div>
                </div>
                <span style={{fontSize:"10px",color:open?c.color:"#4b5563",transform:open?"rotate(180deg)":"rotate(0deg)",transition:"transform .25s",display:"inline-block",flexShrink:0}}>▼</span>
              </button>
              {open&&<div style={{padding:"12px",background:"rgba(0,0,0,.18)",animation:"itemFade .22s ease-out"}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"7px"}}>
                  {c.items.map((item,ii)=><TopicCard key={item.id} item={item} catColor={c.color} onLeafClick={onLeafClick} animDelay={ii*18}/>)}
                </div>
              </div>}
            </div>);})}
        </div>
      )}
    </div>
  );
}

// ─── FEATURE CARD ─────────────────────────────────────────────────────────────
function FeatureCard({icon,title,desc,accent}){
  const[hov,setHov]=useState(false);
  return(
    <div className="feat-card" onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{position:"relative",overflow:"hidden",background:hov?`${accent}09`:"rgba(255,255,255,.025)",border:`1px solid ${hov?accent+"38":"rgba(255,255,255,.065)"}`,borderRadius:"18px",padding:"28px 24px",transition:"all .35s cubic-bezier(.16,1,.3,1)",transform:hov?"translateY(-8px) scale(1.02)":"translateY(0) scale(1)",cursor:"default",boxShadow:hov?`0 28px 60px ${accent}18,inset 0 1px 0 rgba(255,255,255,.08)`:"inset 0 1px 0 rgba(255,255,255,.03)"}}>
      <div style={{position:"absolute",top:0,left:0,width:"110px",height:"110px",background:`radial-gradient(circle at 0% 0%,${accent}${hov?"28":"0f"},transparent 65%)`,pointerEvents:"none",transition:"opacity .3s"}}/>
      {hov&&<div style={{position:"absolute",bottom:0,right:0,width:"130px",height:"130px",background:`radial-gradient(circle at 100% 100%,${accent}12,transparent 65%)`,pointerEvents:"none"}}/>}
      <div style={{width:"48px",height:"48px",borderRadius:"14px",background:hov?`${accent}26`:`${accent}14`,border:`1px solid ${hov?accent+"40":accent+"22"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",marginBottom:"18px",boxShadow:hov?`0 0 24px ${accent}40`:"none",transition:"all .3s"}}>{icon}</div>
      <div style={{fontSize:"14px",fontWeight:800,color:hov?"#f1f5f9":"#e2e8f0",marginBottom:"10px",letterSpacing:"-.01em"}}>{title}</div>
      <div style={{fontSize:"12px",color:"#4b5563",lineHeight:1.8}}>{desc}</div>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:"2px",background:`linear-gradient(to right,transparent,${accent}${hov?"70":"25"},transparent)`,transition:"opacity .3s"}}/>
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({num,suffix,label,accent}){
  const[count,setCount]=useState(0);
  const ref=useRef(null),started=useRef(false);
  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{
      if(e.isIntersecting&&!started.current){
        started.current=true;
        let s=0;const step=num/70;
        const t=setInterval(()=>{s+=step;if(s>=num){setCount(num);clearInterval(t);}else setCount(Math.floor(s));},14);
      }
    });
    if(ref.current)obs.observe(ref.current);return()=>obs.disconnect();
  },[num]);
  return(
    <div ref={ref} className="stat-card" style={{textAlign:"center",padding:"32px 18px",borderRadius:"18px",background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.07)",position:"relative",overflow:"hidden",backdropFilter:"blur(10px)"}}>
      <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:"70%",height:"1px",background:`linear-gradient(to right,transparent,${accent}70,transparent)`}}/>
      <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 110%,${accent}07,transparent 65%)`,pointerEvents:"none"}}/>
      <div style={{fontSize:"clamp(32px,4vw,50px)",fontWeight:900,fontFamily:"'Space Mono',monospace",color:accent,lineHeight:1,marginBottom:"9px",letterSpacing:"-.02em",filter:`drop-shadow(0 0 20px ${accent}65)`}}>{count}{suffix}</div>
      <div style={{fontSize:"11px",color:"#4b5563",fontWeight:600,letterSpacing:".06em",textTransform:"uppercase"}}>{label}</div>
    </div>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({message,onClose}){
  useEffect(()=>{const t=setTimeout(onClose,2600);return()=>clearTimeout(t);},[onClose]);
  return(
    <div style={{position:"fixed",bottom:"26px",right:"26px",background:"linear-gradient(135deg,#4f46e5,#7c3aed)",color:"#fff",padding:"13px 22px",borderRadius:"13px",fontSize:"12px",fontWeight:600,zIndex:9999,boxShadow:"0 8px 36px rgba(99,102,241,.55),inset 0 1px 0 rgba(255,255,255,.12)",animation:"toastIn .3s cubic-bezier(.16,1,.3,1)",maxWidth:"calc(100vw - 52px)",display:"flex",alignItems:"center",gap:"9px"}}>
      <span style={{opacity:.7,fontSize:"10px"}}>✦</span>{message}
    </div>
  );
}

// ─── AUTH MODAL (ENHANCED) ────────────────────────────────────────────────────
function AuthModal({mode,onClose}){
  const[tab,setTab]=useState(mode);
  const[focusField,setFocusField]=useState(null);
  const[loading,setLoading]=useState(false);
  useEffect(()=>{
    const h=e=>{if(e.key==="Escape")onClose();};
    document.addEventListener("keydown",h);return()=>document.removeEventListener("keydown",h);
  },[onClose]);

  const handleSubmit=()=>{
    setLoading(true);
    setTimeout(()=>setLoading(false),1800);
  };

  const inp=(field)=>({
    width:"100%",
    background:focusField===field?"rgba(129,140,248,.07)":"rgba(255,255,255,.03)",
    border:`1px solid ${focusField===field?"rgba(129,140,248,.5)":"rgba(255,255,255,.09)"}`,
    borderRadius:"12px",padding:"13px 16px",color:"#e2e8f0",fontSize:"13px",outline:"none",
    fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box",
    transition:"all .22s",
    boxShadow:focusField===field?"0 0 0 3px rgba(99,102,241,.12),inset 0 1px 0 rgba(255,255,255,.04)":"inset 0 1px 0 rgba(255,255,255,.02)",
  });

  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:500,background:"rgba(2,6,14,.94)",backdropFilter:"blur(32px) saturate(160%)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",animation:"fadeInScale .28s cubic-bezier(.16,1,.3,1)"}}>
      <div onClick={e=>e.stopPropagation()} style={{position:"relative",width:"100%",maxWidth:"420px",animation:"modalSlideUp .38s cubic-bezier(.16,1,.3,1)"}}>

        {/* Outer glow ring */}
        <div style={{position:"absolute",inset:"-2px",borderRadius:"26px",background:"linear-gradient(135deg,rgba(99,102,241,.35),rgba(167,139,250,.25),rgba(34,211,238,.2),rgba(99,102,241,.35))",backgroundSize:"300% 300%",animation:"borderSpin 5s linear infinite",zIndex:0}}/>

        <div style={{position:"relative",zIndex:1,background:"linear-gradient(155deg,#0b0b24 0%,#060614 55%,#080820 100%)",borderRadius:"24px",padding:"36px",boxShadow:"0 60px 100px rgba(0,0,0,.7),0 0 0 1px rgba(129,140,248,.08),inset 0 1px 0 rgba(255,255,255,.07)"}}>

          {/* Top line */}
          <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:"60%",height:"2px",background:"linear-gradient(to right,transparent,rgba(129,140,248,.6) 30%,rgba(167,139,250,.7) 50%,rgba(129,140,248,.6) 70%,transparent)",borderRadius:"999px"}}/>

          {/* Ambient top-left orb */}
          <div style={{position:"absolute",top:"-40px",left:"-40px",width:"180px",height:"180px",borderRadius:"50%",background:"radial-gradient(circle,rgba(99,102,241,.12),transparent 70%)",pointerEvents:"none",filter:"blur(20px)"}}/>
          <div style={{position:"absolute",bottom:"-40px",right:"-40px",width:"160px",height:"160px",borderRadius:"50%",background:"radial-gradient(circle,rgba(34,211,238,.08),transparent 70%)",pointerEvents:"none",filter:"blur(20px)"}}/>

          {/* Close btn */}
          <button onClick={onClose} style={{position:"absolute",top:"16px",right:"16px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.09)",borderRadius:"10px",color:"#475569",fontSize:"14px",cursor:"pointer",padding:"7px 10px",lineHeight:1,transition:"all .2s",zIndex:2}}
            onMouseEnter={e=>{e.currentTarget.style.color="#94a3b8";e.currentTarget.style.background="rgba(255,255,255,.09)";}}
            onMouseLeave={e=>{e.currentTarget.style.color="#475569";e.currentTarget.style.background="rgba(255,255,255,.05)";}}>✕</button>

          {/* Logo */}
          <div style={{display:"flex",justifyContent:"center",marginBottom:"28px"}}><PremiumLogo/></div>

          {/* Welcome text */}
          <div style={{textAlign:"center",marginBottom:"24px"}}>
            <h3 style={{fontSize:"20px",fontWeight:900,color:"#f1f5f9",letterSpacing:"-.02em",marginBottom:"6px",fontFamily:"'Space Mono',monospace"}}>
              {tab==="signin"?"Welcome back":"Join the grind"}
            </h3>
            <p style={{fontSize:"12px",color:"#475569"}}>{tab==="signin"?"Continue your DSA journey":"Get started"}</p>
          </div>

          {/* Tab switcher */}
          <div style={{display:"flex",gap:"3px",padding:"4px",borderRadius:"14px",background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",marginBottom:"24px",position:"relative"}}>
            <div style={{position:"absolute",top:"4px",left:tab==="signin"?"4px":"calc(50% + 1.5px)",width:"calc(50% - 5.5px)",bottom:"4px",borderRadius:"11px",background:"rgba(99,102,241,.22)",border:"1px solid rgba(129,140,248,.38)",transition:"left .28s cubic-bezier(.16,1,.3,1)",boxShadow:"0 2px 16px rgba(99,102,241,.3)"}}/>
            {[["signin","Sign In"],["signup","Sign Up"]].map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"10px",borderRadius:"11px",background:"transparent",border:"none",color:tab===id?"#a5b4fc":"#4b5563",fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"color .2s",position:"relative",zIndex:1}}>{label}</button>
            ))}
          </div>

          {/* Fields */}
          <div style={{display:"flex",flexDirection:"column",gap:"14px",marginBottom:"20px"}}>
            {tab==="signup"&&(
              <div>
                <label style={{display:"block",fontSize:"11px",fontWeight:600,color:"#4b5563",letterSpacing:".06em",textTransform:"uppercase",marginBottom:"7px"}}>Full Name</label>
                <input placeholder="Ada Lovelace" style={inp("name")} onFocus={()=>setFocusField("name")} onBlur={()=>setFocusField(null)}/>
              </div>
            )}
            <div>
              <label style={{display:"block",fontSize:"11px",fontWeight:600,color:"#4b5563",letterSpacing:".06em",textTransform:"uppercase",marginBottom:"7px"}}>Email</label>
              <input type="email" placeholder="you@example.com" style={inp("email")} onFocus={()=>setFocusField("email")} onBlur={()=>setFocusField(null)}/>
            </div>
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"7px"}}>
                <label style={{fontSize:"11px",fontWeight:600,color:"#4b5563",letterSpacing:".06em",textTransform:"uppercase"}}>Password</label>
                {tab==="signin"&&<button style={{background:"none",border:"none",color:"#6366f1",fontSize:"10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",padding:0,fontWeight:600}}>Forgot?</button>}
              </div>
              <input type="password" placeholder="••••••••" style={inp("pw")} onFocus={()=>setFocusField("pw")} onBlur={()=>setFocusField(null)}/>
            </div>
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} style={{width:"100%",padding:"15px",borderRadius:"14px",background:loading?"rgba(79,70,229,.6)":"linear-gradient(135deg,#4f46e5,#7c3aed)",border:"none",color:"#fff",fontSize:"14px",fontWeight:700,cursor:loading?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .25s",boxShadow:loading?"none":"0 6px 28px rgba(99,102,241,.42)",position:"relative",overflow:"hidden",letterSpacing:".02em"}}
            onMouseEnter={e=>{if(!loading){e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 14px 50px rgba(99,102,241,.62)";e.currentTarget.style.letterSpacing=".04em";}}}
            onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 6px 28px rgba(99,102,241,.42)";e.currentTarget.style.letterSpacing=".02em";}}>
            {loading?(
              <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"10px"}}>
                <span style={{width:"14px",height:"14px",border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spinLoader .7s linear infinite"}}/>
                Authenticating...
              </span>
            ):(
              tab==="signin"?"Sign In →":"Create Account →"
            )}
            {!loading&&<div style={{position:"absolute",top:"-50%",left:"-60%",width:"45%",height:"200%",background:"rgba(255,255,255,.12)",transform:"skewX(-20deg)",transition:"left .6s"}} className="btn-sheen"/>}
          </button>

          {/* Divider */}
          <div style={{display:"flex",alignItems:"center",gap:"12px",margin:"20px 0"}}>
            <div style={{flex:1,height:"1px",background:"rgba(255,255,255,.06)"}}/><span style={{fontSize:"10px",color:"#1e293b",letterSpacing:".08em",fontFamily:"'Space Mono',monospace"}}>OR</span><div style={{flex:1,height:"1px",background:"rgba(255,255,255,.06)"}}/>
          </div>

          {/* Google btn */}
          <button style={{width:"100%",padding:"13px",borderRadius:"13px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.09)",color:"#94a3b8",fontSize:"13px",fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:"10px",transition:"all .22s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.08)";e.currentTarget.style.borderColor="rgba(255,255,255,.15)";e.currentTarget.style.color="#cbd5e1";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.04)";e.currentTarget.style.borderColor="rgba(255,255,255,.09)";e.currentTarget.style.color="#94a3b8";}}>
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.615 24 12.255 24z"/><path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"/><path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.64 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
            Continue with Google
          </button>

          <p style={{textAlign:"center",fontSize:"11px",color:"#1e293b",marginTop:"18px"}}>
            {tab==="signin"?"Don't have an account? ":"Already have an account? "}
            <button onClick={()=>setTab(tab==="signin"?"signup":"signin")} style={{background:"none",border:"none",color:"#818cf8",fontSize:"11px",cursor:"pointer",fontWeight:700,padding:0,fontFamily:"'DM Sans',sans-serif",transition:"color .18s"}} onMouseEnter={e=>e.target.style.color="#c084fc"} onMouseLeave={e=>e.target.style.color="#818cf8"}>{tab==="signin"?"Sign Up →":"Sign In →"}</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage(){
  const router=useRouter();
  const[toast,setToast]=useState(null);
  const[scrollY,setScrollY]=useState(0);
  const[mobileMenuOpen,setMobileMenuOpen]=useState(false);
  const[authModal,setAuthModal]=useState(null);
  const isMobile=useIsMobile(768);
  const scrollDir=useScrollDir();

  useLenis();

  useEffect(()=>{
    const fn=()=>setScrollY(window.scrollY);
    window.addEventListener("scroll",fn,{passive:true});
    return()=>window.removeEventListener("scroll",fn);
  },[]);

  // ─── GSAP animation when scrolling up ─────────────────────────────────────
  useEffect(() => {
    if (scrollDir === "up") {
      // Dynamically import GSAP to avoid conflicts, but it's already loaded
      import("gsap").then((mod) => {
        const gsap = mod.gsap || mod.default;
        // Animate the hero badge: subtle scale and glow
        const badge = document.querySelector(".hero-badge");
        if (badge) {
          gsap.to(badge, {
            scale: 1.05,
            duration: 0.4,
            ease: "power2.out",
            yoyo: true,
            repeat: 1,
            overwrite: true,
          });
        }
        // Animate nav bar bottom border for a brief highlight
        const nav = document.querySelector(".vs-nav");
        if (nav) {
          gsap.to(nav, {
            borderBottomColor: "rgba(129,140,248,0.3)",
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            overwrite: true,
          });
        }
      });
    }
  }, [scrollDir]);

  const handleLeafClick=useCallback(item=>{
    const route=ROUTES[item.id];
    if(route){setToast(`Opening ${item.label}…`);router.push(route);}
    else setToast(`${item.label} — coming soon!`);
  },[router]);

  const features=[
    {icon:"⚡",accent:"#818cf8",title:"Step-by-step playback",desc:"Pause, rewind and scrub through every operation at any speed from 0.25× to 4×."},
    {icon:"🎨",accent:"#a78bfa",title:"Fluid animations",desc:"Every pointer, swap and comparison rendered with colour-coded precision."},
    {icon:"📊",accent:"#22d3ee",title:"Live Big-O analysis",desc:"Time and space complexity updates in real-time as your algorithm executes."},
    {icon:"🧠",accent:"#34d399",title:"40+ topics",desc:"Arrays to Dijkstra — the full competitive-programming toolkit, nothing left out."},
    {icon:"🔗",accent:"#f472b6",title:"Interactive explorer",desc:"Select any category and click a card to launch that visualizer immediately."},
    {icon:"🌙",accent:"#fb923c",title:"Built for grinders",desc:"Dark-first, zero-distraction. Engineered for focused late-night sessions."},
  ];
  const stats=[
    {num:40,suffix:"+",label:"Topics covered",accent:"#818cf8"},
    {num:12,suffix:"+",label:"Sorting algorithms",accent:"#22d3ee"},
    {num:8,suffix:"+",label:"Graph algorithms",accent:"#34d399"},
      {num:1000,suffix:"+",label:"Lines of code",accent:"#a78bfa"},
  ];
  const navScrolled=scrollY>40;
  // Nav hides on scroll down past 100px, reveals on scroll up
  const navHidden=scrollY>100&&scrollDir==="down";

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{-webkit-text-size-adjust:100%;scroll-behavior:auto;}
        body{background:#030912;font-family:'DM Sans',sans-serif;color:#e2e8f0;overflow-x:hidden;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-track{background:#030912;}
        ::-webkit-scrollbar-thumb{background:linear-gradient(to bottom,#4f46e5,#7c3aed);border-radius:2px;}

        @keyframes toastIn{from{opacity:0;transform:translateY(14px)scale(.94)}to{opacity:1;transform:none}}
        @keyframes pulseRing{0%,100%{opacity:.3;transform:translate(-50%,-50%)scale(1)}50%{opacity:.06;transform:translate(-50%,-50%)scale(1.25)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes scrollBounce{0%,100%{transform:translateX(-50%)translateY(0)}50%{transform:translateX(-50%)translateY(9px)}}
        @keyframes itemFade{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}
        @keyframes scanline{0%{left:-50%}100%{left:150%}}
        @keyframes badgePulse{0%,100%{opacity:1;box-shadow:0 0 6px #6ee7b7}50%{opacity:.55;box-shadow:0 0 16px #6ee7b7}}
        @keyframes badgeSweep{0%{left:-80%}60%,100%{left:170%}}
        @keyframes logoPulse{0%,100%{opacity:.7;transform:scale(1)}50%{opacity:1;transform:scale(1.09)}}
        @keyframes borderSpin{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes fadeInScale{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
        @keyframes modalSlideUp{from{opacity:0;transform:translateY(40px)scale(.95)}to{opacity:1;transform:translateY(0)scale(1)}}
        @keyframes driftOrb{0%,100%{transform:translate(0,0)}33%{transform:translate(26px,-20px)}66%{transform:translate(-16px,14px)}}
        @keyframes gridPulse{0%,100%{opacity:.016}50%{opacity:.038}}
        @keyframes floatBadge{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes spinLoader{to{transform:rotate(360deg)}}
        @keyframes heroGlow{0%,100%{opacity:.55}50%{opacity:.9}}
        @keyframes textFlicker{0%,100%{opacity:1}92%{opacity:1}93%{opacity:.6}94%{opacity:1}96%{opacity:.7}97%{opacity:1}}
        @keyframes neonPulse{0%,100%{text-shadow:0 0 20px rgba(129,140,248,.9),0 0 60px rgba(99,102,241,.5),0 0 100px rgba(99,102,241,.2)}50%{text-shadow:0 0 30px rgba(129,140,248,1),0 0 80px rgba(99,102,241,.7),0 0 140px rgba(99,102,241,.35)}}
        @keyframes line1Glow{0%,100%{filter:drop-shadow(0 0 20px rgba(129,140,248,.55))}50%{filter:drop-shadow(0 0 40px rgba(129,140,248,.85))}}
        @keyframes line2Glow{0%,100%{filter:drop-shadow(0 0 16px rgba(248,250,252,.2))}50%{filter:drop-shadow(0 0 32px rgba(248,250,252,.45))}}

        .shimmer-text{
          background:linear-gradient(90deg,#6366f1 0%,#a5b4fc 22%,#e0e7ff 44%,#c084fc 66%,#a5b4fc 88%,#6366f1 100%);
          background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;
          background-clip:text;animation:shimmer 4.5s linear infinite;display:inline-block;
          padding-bottom:.12em;margin-bottom:-.12em;
        }
        .container{width:100%;max-width:1180px;margin:0 auto;padding-left:clamp(16px,4vw,44px);padding-right:clamp(16px,4vw,44px);box-sizing:border-box;}

        /* NAV smart hide/show */
        .vs-nav{opacity:0;transition:transform .45s cubic-bezier(.16,1,.3,1),background .35s,border-color .35s,box-shadow .35s;}
        .nav-scrolled-up{transform:translateY(0)!important;}
        .nav-scrolled-down{transform:translateY(-110%)!important;}

        .nav-bar-inner{display:flex;align-items:center;justify-content:space-between;height:64px;}
        .nav-links-right{display:flex;align-items:center;gap:4px;}
        @media(max-width:768px){.nav-links-right{display:none!important;}}
        .nav-link{color:#4b5563;text-decoration:none;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;padding:6px 14px;border-radius:9px;border:1px solid transparent;transition:all .22s;white-space:nowrap;}
        .nav-link:hover{color:#c7d2fe;background:rgba(129,140,248,.09);border-color:rgba(129,140,248,.22);}

        /* Hero text special */
        .hero-line1{
          display:block;overflow:visible;
          animation:line1Glow 4s ease-in-out infinite,textFlicker 8s linear infinite;
        }
        .hero-line2{
          display:block;overflow:visible;
          animation:line2Glow 5s ease-in-out infinite 1s;
        }

        /* CTA Buttons */
        .glow-btn{
          background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;border:none;border-radius:13px;
          padding:15px 34px;font-size:14px;font-weight:700;cursor:pointer;position:relative;overflow:hidden;
          transition:transform .22s,box-shadow .22s,letter-spacing .22s;
          box-shadow:0 4px 28px rgba(99,102,241,.42);
          font-family:'DM Sans',sans-serif;letter-spacing:.02em;white-space:nowrap;
          display:inline-flex;align-items:center;justify-content:center;text-decoration:none;
        }
        .glow-btn:hover{transform:translateY(-4px) scale(1.02);box-shadow:0 16px 56px rgba(99,102,241,.65);letter-spacing:.05em;}
        .glow-btn:active{transform:translateY(0)scale(.97);}
        .glow-btn::after{content:'';position:absolute;top:-50%;left:-60%;width:45%;height:200%;background:rgba(255,255,255,.16);transform:skewX(-20deg);transition:left .5s;}
        .glow-btn:hover::after{left:125%;}

        /* HR lines */
        .hr-line{width:100%;height:1px;background:linear-gradient(to right,transparent,rgba(255,255,255,.065) 20%,rgba(255,255,255,.065) 80%,transparent);transform-origin:left center;}

        /* Feature grid */
        .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
        @media(max-width:1024px){.stats-grid{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:900px){.feat-grid{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:768px){
          .hero-btns{flex-direction:column!important;align-items:stretch!important;width:100%;}
          .hero-btns .glow-btn{width:100%;max-width:100%;}
        }
        @media(max-width:580px){
          .feat-grid{grid-template-columns:1fr;}
          .stats-grid{grid-template-columns:repeat(2,1fr);}
          .footer-inner{flex-direction:column!important;align-items:center!important;text-align:center;gap:16px!important;}
          .footer-links{justify-content:center!important;}
        }

        /* Mobile menu */
        .mobile-menu-overlay{position:fixed;inset:0;z-index:200;background:rgba(3,9,18,.97);backdrop-filter:blur(28px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;animation:fadeInScale .26s cubic-bezier(.16,1,.3,1);}
        .mobile-nav-link{color:#64748b;text-decoration:none;font-size:24px;font-weight:800;transition:color .2s;letter-spacing:-.02em;}
        .mobile-nav-link:hover{color:#c7d2fe;}
        .hamburger-btn{display:none;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:8px 11px;color:#64748b;cursor:pointer;font-size:16px;transition:all .2s;line-height:1;}
        @media(max-width:768px){.hamburger-btn{display:flex;align-items:center;justify-content:center;}}
        .hamburger-btn:hover{color:#c7d2fe;background:rgba(129,140,248,.1);border-color:rgba(129,140,248,.25);}

        /* Auth buttons */
        .auth-btn-si{padding:7px 16px;border-radius:9px;font-size:12px;font-weight:600;color:#64748b;background:transparent;border:1px solid rgba(255,255,255,.08);cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s;white-space:nowrap;}
        .auth-btn-si:hover{color:#c7d2fe;border-color:rgba(129,140,248,.32);background:rgba(129,140,248,.08);}
        .auth-btn-su{padding:7px 16px;border-radius:9px;font-size:12px;font-weight:700;color:#fff;background:linear-gradient(135deg,rgba(79,70,229,.9),rgba(124,58,237,.9));border:1px solid rgba(129,140,248,.38);cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s;white-space:nowrap;box-shadow:0 2px 14px rgba(99,102,241,.22);}
        .auth-btn-su:hover{box-shadow:0 6px 28px rgba(99,102,241,.5);transform:translateY(-1px);}

        /* GSAP initial hidden states */
        .hero-badge,.hero-eyebrow,.hero-line1,.hero-line2,.hero-sub,
        .btn-primary,.btn-secondary,.hero-scroll-hint,
        .stat-card,.feat-card,.explorer-panel,.cta-inner,.cta-h2,
        .section-label,.section-heading,footer,.hr-line,.legend-dot{opacity:0;}
        .hero-content-wrap{will-change:transform,opacity,filter;}

        /* Btn sheen hover */
        .glow-btn:hover .btn-sheen{left:125%!important;}

        /* Auth modal btn sheen */
        button:hover .btn-sheen{left:125%!important;}
      `}</style>

      <ParticleCanvas/>
      {authModal&&<AuthModal mode={authModal} onClose={()=>setAuthModal(null)}/>}

      {/* Mobile menu overlay */}
      {mobileMenuOpen&&(
        <div className="mobile-menu-overlay">
          <button onClick={()=>setMobileMenuOpen(false)} style={{position:"absolute",top:"16px",right:"16px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:"9px",color:"#64748b",fontSize:"16px",cursor:"pointer",padding:"8px 11px",lineHeight:1}}>✕</button>
          <PremiumLogo size="lg"/>
          {[["#features","Features"],["#tree","Topics"]].map(([href,label])=>(
            <a key={href} href={href} onClick={()=>setMobileMenuOpen(false)} className="mobile-nav-link">{label}</a>
          ))}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"10px",width:"100%",maxWidth:"260px"}}>
            <button onClick={()=>{setMobileMenuOpen(false);setAuthModal("signin");}} className="auth-btn-si" style={{width:"100%",padding:"12px",fontSize:"14px"}}>Sign In</button>
            <button onClick={()=>{setMobileMenuOpen(false);setAuthModal("signup");}} className="auth-btn-su" style={{width:"100%",padding:"12px",fontSize:"14px"}}>Sign Up</button>
          </div>
        </div>
      )}

      {/* ══ NAV — smart hide on scroll down */}
      <nav className={`vs-nav ${navHidden?"nav-scrolled-down":"nav-scrolled-up"}`}
        style={{position:"fixed",top:0,left:0,right:0,zIndex:100,
          background:navScrolled?"rgba(3,9,18,.97)":"rgba(3,9,18,.45)",
          backdropFilter:"blur(36px) saturate(200%)",
          borderBottom:navScrolled?"1px solid rgba(255,255,255,.09)":"1px solid rgba(255,255,255,.04)",
          boxShadow:navScrolled?"0 1px 40px rgba(0,0,0,.4)":"none"}}>
        {navScrolled&&<div style={{position:"absolute",top:0,left:0,right:0,height:"1px",background:"linear-gradient(to right,transparent,rgba(129,140,248,.5) 30%,rgba(167,139,250,.6) 50%,rgba(129,140,248,.5) 70%,transparent)"}}/>}
        <div className="container" style={{paddingTop:0,paddingBottom:0}}>
          <div className="nav-bar-inner">
            <div style={{display:"flex",alignItems:"center"}}><PremiumLogo/></div>
            <div className="nav-links-right">
              {[["#features","Features"],["#tree","Topics"]].map(([href,label])=>(
                <a key={href} href={href} className="nav-link">{label}</a>
              ))}
              <div style={{width:"1px",height:"20px",background:"rgba(255,255,255,.08)",margin:"0 6px"}}/>
              <button onClick={()=>setAuthModal("signin")} className="auth-btn-si">Sign In</button>
              <button onClick={()=>setAuthModal("signup")} className="auth-btn-su">Sign Up</button>
            </div>
            <button className="hamburger-btn" onClick={()=>setMobileMenuOpen(true)} aria-label="Open menu">☰</button>
          </div>
        </div>
      </nav>

      {/* ══ HERO */}
      <section className="hero-section" style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",paddingTop:"clamp(100px,14vw,130px)",paddingBottom:"clamp(60px,8vw,90px)",position:"relative",zIndex:1,textAlign:"center",overflow:"hidden",width:"100%"}}>

        {/* Animated grid */}
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(129,140,248,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(129,140,248,.02) 1px,transparent 1px)",backgroundSize:"60px 60px",animation:"gridPulse 7s ease-in-out infinite",pointerEvents:"none",zIndex:0}}/>

        {/* Layered orb meshes */}
        <div className="hero-mesh-1 amb-orb" style={{position:"absolute",width:"min(1100px,150vw)",height:"min(900px,120vw)",borderRadius:"50%",background:"radial-gradient(ellipse,rgba(79,70,229,.22) 0%,rgba(99,102,241,.08) 35%,transparent 68%)",top:"50%",left:"50%",transform:"translate(-50%,-58%)",pointerEvents:"none",zIndex:0,animation:"heroGlow 6s ease-in-out infinite"}}/>
        <div className="hero-mesh-2 amb-orb" style={{position:"absolute",width:"min(600px,90vw)",height:"min(600px,90vw)",borderRadius:"50%",background:"radial-gradient(circle,rgba(129,140,248,.28) 0%,rgba(99,102,241,.1) 40%,transparent 68%)",top:"44%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none",zIndex:0,animation:"driftOrb 12s ease-in-out infinite"}}/>
        <div className="hero-mesh-3 amb-orb" style={{position:"absolute",width:"min(420px,60vw)",height:"min(420px,60vw)",borderRadius:"50%",background:"radial-gradient(circle,rgba(167,139,250,.16) 0%,transparent 65%)",top:"36%",left:"66%",transform:"translateX(-50%)",pointerEvents:"none",zIndex:0,animation:"driftOrb 17s ease-in-out infinite reverse"}}/>

        {/* Cyan accent orb */}
        <div style={{position:"absolute",width:"min(300px,45vw)",height:"min(300px,45vw)",borderRadius:"50%",background:"radial-gradient(circle,rgba(34,211,238,.1) 0%,transparent 65%)",top:"60%",left:"22%",pointerEvents:"none",zIndex:0,animation:"driftOrb 22s ease-in-out infinite"}}/>

        {/* Top glint */}
        <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:"60%",height:"2px",background:"linear-gradient(to right,transparent,rgba(129,140,248,.4) 30%,rgba(167,139,250,.55) 50%,rgba(129,140,248,.4) 70%,transparent)",pointerEvents:"none",zIndex:1}}/>

        {/* Pulse rings */}
        <div style={{position:"absolute",width:"min(780px,105vw)",height:"min(780px,105vw)",borderRadius:"50%",border:"1px solid rgba(99,102,241,.055)",top:"50%",left:"50%",transform:"translate(-50%,-50%)",animation:"pulseRing 10s ease-in-out infinite",pointerEvents:"none",zIndex:0}}/>
        <div style={{position:"absolute",width:"min(560px,80vw)",height:"min(560px,80vw)",borderRadius:"50%",border:"1px solid rgba(129,140,248,.045)",top:"50%",left:"50%",transform:"translate(-50%,-50%)",animation:"pulseRing 13s ease-in-out infinite .9s",pointerEvents:"none",zIndex:0}}/>
        <div style={{position:"absolute",width:"min(360px,55vw)",height:"min(360px,55vw)",borderRadius:"50%",border:"1px solid rgba(167,139,250,.035)",top:"50%",left:"50%",transform:"translate(-50%,-50%)",animation:"pulseRing 8s ease-in-out infinite 1.6s",pointerEvents:"none",zIndex:0}}/>

        <div className="hero-content-wrap container" style={{display:"flex",flexDirection:"column",alignItems:"center",width:"100%",position:"relative",zIndex:1}}>

          {/* Badge */}
          <div className="hero-badge" style={{display:"inline-flex",alignItems:"center",gap:"9px",background:"rgba(110,231,183,.07)",border:"1px solid rgba(110,231,183,.24)",borderRadius:"999px",padding:"5px 18px 5px 12px",fontSize:"10px",fontWeight:700,color:"#6ee7b7",letterSpacing:".1em",textTransform:"uppercase",marginBottom:"28px",animation:"floatBadge 3.8s ease-in-out infinite",backdropFilter:"blur(10px)",boxShadow:"0 0 20px rgba(110,231,183,.08)"}}>
            <span style={{width:"6px",height:"6px",borderRadius:"50%",background:"#6ee7b7",display:"inline-block",animation:"badgePulse 2s ease-in-out infinite",flexShrink:0}}/>
            Visual Learning · 40+ Topics 
          </div>

          {/* Eyebrow */}
          <div className="hero-eyebrow" style={{fontSize:"10px",fontWeight:700,letterSpacing:".22em",color:"#374151",textTransform:"uppercase",marginBottom:"16px",fontFamily:"'Space Mono',monospace"}}>DSA Mastery Platform</div>

          {/* H1 — THE MAIN HERO TEXT — fixed visibility */}
          <h1 style={{fontSize:"clamp(40px,9.5vw,104px)",fontWeight:900,lineHeight:1,maxWidth:"880px",marginBottom:"24px",letterSpacing:"-.032em",position:"relative",zIndex:2}}>
            <span className="hero-line1" style={{
              background:"linear-gradient(135deg,#c7d2fe 0%,#a5b4fc 30%,#818cf8 55%,#6366f1 80%,#4f46e5 100%)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
              display:"block",paddingBottom:"0.08em",marginBottom:"-0.08em",
            }}>See the code.</span>
            <span className="hero-line2" style={{
              color:"#f8fafc",
              display:"block",
              textShadow:"0 0 80px rgba(248,250,252,.12)",
            }}>Feel the logic.</span>
          </h1>

          {/* Sub */}
          <p className="hero-sub" style={{fontSize:"clamp(14px,2vw,17px)",color:"#64748b",maxWidth:"500px",lineHeight:1.9,marginBottom:"38px"}}>
            Interactive visualizations for every major data structure and algorithm.
            Step through, watch complexity unfold — finally{" "}
            <em style={{color:"#a5b4fc",fontStyle:"normal",fontWeight:700,background:"rgba(99,102,241,.12)",padding:"1px 10px",borderRadius:"7px",border:"1px solid rgba(99,102,241,.22)"}}>understand</em>{" "}DSA.
          </p>

          {/* CTA buttons */}
          <div className="hero-btns" style={{display:"flex",gap:"13px",flexWrap:"wrap",justifyContent:"center",alignItems:"center",width:"100%",maxWidth:"500px"}}>
            <a href="#tree" className="glow-btn btn-primary" style={{flex:"1 1 auto",fontSize:"15px",padding:"16px 36px"}}>
              Explore Topics ↓
              <div style={{position:"absolute",top:"-50%",left:"-60%",width:"45%",height:"200%",background:"rgba(255,255,255,.12)",transform:"skewX(-20deg)",transition:"left .5s"}} className="btn-sheen"/>
            </a>
            <a
              href="https://fundamentals-eight.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{
                flex:"1 1 auto",
                fontSize:"14px",
                padding:"15px 28px",
                borderRadius:"13px",
                background:"rgba(255,255,255,.05)",
                border:"1px solid rgba(255,255,255,.11)",
                color:"#94a3b8",
                fontWeight:700,
                cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif",
                transition:"all .26s cubic-bezier(.16,1,.3,1)",
                letterSpacing:".02em",
                position:"relative",
                overflow:"hidden",
                textDecoration:"none",
                display:"inline-flex",
                alignItems:"center",
                justifyContent:"center",
              }}
              onMouseEnter={e=>{
                e.currentTarget.style.background="rgba(129,140,248,.1)";
                e.currentTarget.style.borderColor="rgba(129,140,248,.38)";
                e.currentTarget.style.color="#c7d2fe";
                e.currentTarget.style.transform="translateY(-4px) scale(1.02)";
                e.currentTarget.style.boxShadow="0 14px 40px rgba(99,102,241,.2)";
              }}
              onMouseLeave={e=>{
                e.currentTarget.style.background="rgba(255,255,255,.05)";
                e.currentTarget.style.borderColor="rgba(255,255,255,.11)";
                e.currentTarget.style.color="#94a3b8";
                e.currentTarget.style.transform="translateY(0)scale(1)";
                e.currentTarget.style.boxShadow="none";
              }}
            >
              Beginner →
            </a>
          </div>

          {/* Scroll hint */}
          <div className="hero-scroll-hint" style={{marginTop:"clamp(48px,6vw,64px)",display:"flex",flexDirection:"column",alignItems:"center",gap:"6px",animation:"scrollBounce 2.8s ease-in-out infinite"}}>
            <span style={{fontSize:"9px",letterSpacing:".16em",color:"#374151",textTransform:"uppercase",fontFamily:"'Space Mono',monospace"}}>scroll</span>
            <div style={{width:"1px",height:"30px",background:"linear-gradient(to bottom,#6366f1,transparent)"}}/>
          </div>
        </div>
      </section>

      <div className="hr-line"/>

      {/* ══ STATS */}
      <section style={{paddingTop:"clamp(52px,6vw,72px)",paddingBottom:"clamp(52px,6vw,72px)",position:"relative",zIndex:1}}>
        <div className="container">
          <div className="stats-grid">
            {stats.map(s=><StatCard key={s.label}{...s}/>)}
          </div>
        </div>
      </section>

      <div className="hr-line"/>

      {/* ══ FEATURES */}
      <section id="features" style={{paddingTop:"clamp(72px,9vw,110px)",paddingBottom:"clamp(72px,9vw,110px)",position:"relative",zIndex:1}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 0%,rgba(79,70,229,.05) 0%,transparent 55%)",pointerEvents:"none"}}/>
        <div className="container">
          <div style={{textAlign:"center",marginBottom:"clamp(40px,5vw,58px)"}}>
            <p className="section-label" style={{fontSize:"10px",fontWeight:700,letterSpacing:".16em",color:"#6366f1",textTransform:"uppercase",marginBottom:"12px",fontFamily:"'Space Mono',monospace"}}>Why VisuoSlayer</p>
            <h2 className="section-heading" style={{fontSize:"clamp(26px,4.5vw,48px)",fontWeight:900,color:"#f8fafc",letterSpacing:"-.028em",marginBottom:"14px",lineHeight:1.04}}>
              Everything to{" "}<span className="shimmer-text">master DSA</span>
            </h2>
            <p style={{color:"#4b5563",fontSize:"14px",maxWidth:"360px",margin:"0 auto",lineHeight:1.8}}>One platform. Every structure. Every algorithm. All visual.</p>
          </div>
          <div className="feat-grid">
            {features.map(f=><FeatureCard key={f.title}{...f}/>)}
          </div>
        </div>
      </section>

      <div className="hr-line"/>

      {/* ══ DSA EXPLORER */}
      <section id="tree" style={{paddingTop:"clamp(72px,9vw,110px)",paddingBottom:"clamp(72px,9vw,110px)",position:"relative",zIndex:1,overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 18% 50%,rgba(79,70,229,.06) 0%,transparent 46%),radial-gradient(ellipse at 82% 50%,rgba(8,145,178,.05) 0%,transparent 46%)",pointerEvents:"none"}}/>
        <div className="container" style={{textAlign:"center",marginBottom:"clamp(32px,4vw,48px)"}}>
          <p className="section-label" style={{fontSize:"10px",fontWeight:700,letterSpacing:".16em",color:"#22d3ee",textTransform:"uppercase",marginBottom:"12px",fontFamily:"'Space Mono',monospace"}}>Interactive</p>
          <h2 className="section-heading" style={{fontSize:"clamp(26px,4.5vw,48px)",fontWeight:900,color:"#f8fafc",letterSpacing:"-.028em",lineHeight:1.04}}>
            Click any topic to{" "}<span className="shimmer-text">launch it</span>
          </h2>
        </div>
        <div className="container">
          <div className="explorer-panel" style={{background:"rgba(3,9,18,.7)",border:"1px solid rgba(255,255,255,.085)",borderRadius:"24px",padding:"clamp(16px,2.5vw,28px)",boxShadow:"0 0 0 1px rgba(99,102,241,.06),0 40px 80px rgba(0,0,0,.58),inset 0 1px 0 rgba(255,255,255,.06)",position:"relative",overflow:"hidden",backdropFilter:"blur(18px)"}}>
            <div style={{position:"absolute",top:0,left:0,width:"150px",height:"150px",background:"radial-gradient(circle at 0% 0%,rgba(99,102,241,.15) 0%,transparent 60%)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",bottom:0,right:0,width:"150px",height:"150px",background:"radial-gradient(circle at 100% 100%,rgba(6,182,212,.11) 0%,transparent 60%)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",top:0,left:"-50%",width:"40%",height:"100%",background:"linear-gradient(100deg,transparent,rgba(255,255,255,.005),transparent)",animation:"scanline 12s ease-in-out infinite",pointerEvents:"none"}}/>
            <DSAExplorer onLeafClick={handleLeafClick}/>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:"24px",flexWrap:"wrap",marginTop:"26px",padding:"0 clamp(16px,4vw,44px)"}}>
          {[{dot:"#818cf8",label:"Basic"},{dot:"#22d3ee",label:"Intermediate"},{dot:"#f87171",label:"Advanced"}].map(({dot,label})=>(
            <div key={label} className="legend-dot" style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <span style={{width:"8px",height:"8px",borderRadius:"50%",background:dot,boxShadow:`0 0 8px ${dot}`,display:"inline-block"}}/>
              <span style={{fontSize:"11px",color:"#4b5563",letterSpacing:".04em",fontWeight:500}}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="hr-line"/>

      {/* ══ CTA */}
      <section style={{paddingTop:"clamp(72px,9vw,110px)",paddingBottom:"clamp(72px,9vw,110px)",position:"relative",zIndex:1,overflow:"hidden"}}>
        <div className="container" style={{textAlign:"center",position:"relative"}}>
          <div className="cta-inner" style={{position:"relative",padding:"clamp(44px,5vw,76px) clamp(24px,4vw,64px)",borderRadius:"26px",border:"1px solid rgba(129,140,248,.15)",background:"rgba(255,255,255,.02)",backdropFilter:"blur(16px)",boxShadow:"inset 0 1px 0 rgba(255,255,255,.07),0 30px 70px rgba(0,0,0,.35)"}}>
            <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 50%,rgba(79,70,229,.08) 0%,transparent 65%)",pointerEvents:"none",borderRadius:"26px"}}/>
            <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:"55%",height:"1.5px",background:"linear-gradient(to right,transparent,rgba(129,140,248,.55) 30%,rgba(167,139,250,.65) 50%,rgba(129,140,248,.55) 70%,transparent)",borderRadius:"999px"}}/>
            <p style={{fontSize:"10px",fontWeight:700,letterSpacing:".14em",color:"#6366f1",textTransform:"uppercase",marginBottom:"15px",fontFamily:"'Space Mono',monospace",position:"relative",zIndex:1}}>Ready to grind?</p>
            <h2 className="cta-h2" style={{fontSize:"clamp(28px,5vw,54px)",fontWeight:900,color:"#f8fafc",letterSpacing:"-.026em",lineHeight:1.05,marginBottom:"16px",position:"relative",zIndex:1}}>
              Start visualizing<br/><span className="shimmer-text">algorithms today.</span>
            </h2>
            <p style={{fontSize:"15px",color:"#4b5563",maxWidth:"400px",margin:"0 auto 36px",lineHeight:1.8,position:"relative",zIndex:1}}>Learning algorithms has never been more engaging!</p>
            <div style={{display:"flex",gap:"13px",justifyContent:"center",flexWrap:"wrap",position:"relative",zIndex:1}}>
              <a href="#tree" className="glow-btn" style={{padding:"15px 38px",fontSize:"15px"}}>Browse Topics →</a>
              <a
                href="https://fundamentals-eight.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding:"14px 30px",
                  fontSize:"14px",
                  borderRadius:"13px",
                  background:"rgba(255,255,255,.05)",
                  border:"1px solid rgba(255,255,255,.12)",
                  color:"#94a3b8",
                  fontWeight:700,
                  cursor:"pointer",
                  fontFamily:"'DM Sans',sans-serif",
                  transition:"all .26s cubic-bezier(.16,1,.3,1)",
                  letterSpacing:".02em",
                  textDecoration:"none",
                  display:"inline-flex",
                  alignItems:"center",
                  justifyContent:"center",
                }}
                onMouseEnter={e=>{
                  e.currentTarget.style.background="rgba(129,140,248,.1)";
                  e.currentTarget.style.borderColor="rgba(129,140,248,.38)";
                  e.currentTarget.style.color="#c7d2fe";
                  e.currentTarget.style.transform="translateY(-3px)";
                  e.currentTarget.style.boxShadow="0 12px 36px rgba(99,102,241,.18)";
                }}
                onMouseLeave={e=>{
                  e.currentTarget.style.background="rgba(255,255,255,.05)";
                  e.currentTarget.style.borderColor="rgba(255,255,255,.12)";
                  e.currentTarget.style.color="#94a3b8";
                  e.currentTarget.style.transform="translateY(0)";
                  e.currentTarget.style.boxShadow="none";
                }}
              >
                Beginner →
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="hr-line"/>

      {/* ══ FOOTER */}
      <footer style={{paddingTop:"clamp(28px,3vw,38px)",paddingBottom:"clamp(28px,3vw,38px)",position:"relative",zIndex:1,background:"rgba(3,9,18,.9)"}}>
        <div className="container">
          <div className="footer-inner" style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"14px"}}>
            <PremiumLogo/>
            <div className="footer-links" style={{display:"flex",gap:"22px",flexWrap:"wrap",alignItems:"center"}}>
              {[["#features","Features"],["#tree","Topics"],["#","GitHub"]].map(([href,label])=>(
                <a key={label} href={href} style={{color:"#1e293b",textDecoration:"none",fontSize:"12px",fontWeight:500,transition:"color .18s"}} onMouseEnter={e=>e.target.style.color="#a5b4fc"} onMouseLeave={e=>e.target.style.color="#1e293b"}>{label}</a>
              ))}
              <button onClick={()=>setAuthModal("signin")} style={{background:"none",border:"none",color:"#1e293b",fontSize:"12px",fontWeight:500,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"color .18s",padding:0}} onMouseEnter={e=>e.target.style.color="#a5b4fc"} onMouseLeave={e=>e.target.style.color="#1e293b"}>Sign In</button>
            </div>
            <p style={{color:"#1e293b",fontSize:"11px"}}>Built with Next.js · Open source</p>
          </div>
        </div>
      </footer>

      {toast&&<Toast message={toast} onClose={()=>setToast(null)}/>}
    </>
  );
}