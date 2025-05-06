const projectData = [
  {
    title: "Euphoria",
    image: "./Asset/Images/img1.jpg",
    serv: "Portfolio",
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
    link: "../project-1-scroll.html",
    isAlternate: false,
  },
  {
    title: "Scrathcher",
    image: "./Asset/Images/img2.jpg",
    serv: "Web Design",
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
    link: "../lab.html",
    isAlternate: true,
  },
  {
    title: "Ember",
    image: "./Asset/Images/img3.jpg",
    serv: "Portfolio",
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
    link: "../project-1-drag.html",
    isAlternate: false,
  },
  {
    title: "Liquid Soleil",
    image: "./Asset/Images/img4.jpg",
    serv: "Web Design",
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
    link: "../index.html",
    isAlternate: true,
  },
  // { title: "Vacuum", image: "./Asset/Images/5.png", isAlternate: false },
  // { title: "Synthesis", image: "./Asset/Images/6.png", isAlternate: true },
];

const lerp = (start, end, factor) => start + (end - start) * factor;

const config = {
  SCROLL_SPEED: 0.75,
  LERP_FACTOR: 0.05,
  BUFFER_SIZE: 15,
  CLEANUP_THRESHOLD: 50,
  MAX_VELOCITY: 120,
  SNAP_DURATION: 500,
};

const state = {
  currentY: 0,
  targetY: 0,
  lastY: 0,
  scrollVelovity: 0,
  isDragging: false,
  startY: 0,
  projects: new Map(),
  parallaxImages: new Map(),
  projectHeight: window.innerHeight,
  isSnapping: false,
  snapStartTime: 0,
  snapStartY: 0,
  snapTargetY: 0,
  lastScrollTime: Date.now(),
  isScrolling: false,
};

const createParallaxImage = (imageElement) => {
  let bounds = null;
  let currentTranslateY = 0;
  let targetTranslateY = 0;

  const updateBounds = () => {
    if (imageElement) {
      const rect = imageElement.getBoundingClientRect();
      bounds = {
        top: rect.top + window.scrollY,
        bottom: rect.bottom + window.scrollY,
      };
    }
  };

  const update = (scroll) => {
    if (!bounds) return;
    const relativeScroll = -scroll - bounds.top;
    targetTranslateY = relativeScroll * 0.2;
    currentTranslateY = lerp(currentTranslateY, targetTranslateY, 0.1);

    if (Math.abs(currentTranslateY - targetTranslateY) > 0.01) {
      imageElement.style.transform = `translateY(${currentTranslateY}px) scale(1.5)`;
    }
  };

  updateBounds();
  return { update, updateBounds };
};

const getProjectData = (index) => {
  const dataIndex =
    ((Math.abs(index) % projectData.length) + projectData.length) %
    projectData.length;
  return projectData[dataIndex];
};

const createProjectElement = (index) => {
  if (state.projects.has(index)) return;

  const template = document.querySelector(".project-template");
  const project = template.cloneNode(true);
  project.style.display = "flex";
  project.classList.remove(".project-template");

  const dataIndex =
    ((Math.abs(index) % projectData.length) + projectData.length) %
    projectData.length;
  const data = getProjectData(index);
  const projectNumber = (dataIndex + 1).toString().padStart(2, "0");

  project.innerHTML = data.isAlternate
    ? `<div class="cursor"><p>View Case Study</p></div>
    <a href="${data.link}" class="side side-img">
    <div class="img"><img src="${data.image}" alt="${data.title}" /></div>
    </a>
    <a href="${data.link}" class="side side-desc">
      <div class="title">
        <h1>${data.title}</h1>
        
        <p>${data.desc}</p>
      </div>
    </a>`
    : `<a href="${data.link}" class="side side-desc">
      <div class="title">
        <h1>${data.title}</h1>
        
        <p>${data.desc}</p>
      </div>
    </a>
    <a href="${data.link}" class="side side-img">
      <div class="img"><img src="${data.image}" alt="${data.title}" /></div>
    </a>
    <div class="cursor"><p>View Case Study</p></div>`;

  project.style.transform = `translateY(${index * state.projectHeight}px)`;
  document.querySelector(".project-list").appendChild(project);
  state.projects.set(index, project);

  const img = project.querySelector("img");
  if (img) {
    state.parallaxImages.set(index, createParallaxImage(img));
  }

  const cursors = document.querySelectorAll(".cursor");

  document.addEventListener("mousemove", function (e) {
    cursors.forEach((cursor, index) => {
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });
  });
};

const createInitialProjects = () => {
  for (let i = -config.BUFFER_SIZE; i <= config.BUFFER_SIZE; i++) {
    createProjectElement(i);
  }
};

const getCurrentIndex = () => Math.round(-state.targetY / state.projectHeight);

const checkAndCreateProjects = () => {
  const currentIndex = getCurrentIndex();
  const minNeeded = currentIndex - config.BUFFER_SIZE;
  const maxNeeded = currentIndex + config.BUFFER_SIZE;

  for (let i = minNeeded; i <= maxNeeded; i++) {
    if (!state.projects.has(i)) {
      createProjectElement(i);
    }
  }

  state.projects.forEach((project, index) => {
    if (
      index < currentIndex - config.CLEANUP_THRESHOLD ||
      index > currentIndex + config.CLEANUP_THRESHOLD
    ) {
      project.remove();
      state.projects.delete(index);
      state.parallaxImages.delete(index);
    }
  });
};

const getClosestSnapPoint = () => {
  const currentIndex = Math.round(-state.targetY / state.projectHeight);
  return -currentIndex * state.projectHeight;
};

const initiateSnap = () => {
  state.isSnapping = true;
  state.snapStartTime = Date.now();
  state.snapStartY = state.targetY;
  state.snapTargetY = getClosestSnapPoint();
};

const updateSnap = () => {
  const elapsed = Date.now() - state.snapStartTime;
  const progress = Math.min(elapsed / config.SNAP_DURATION, 1);

  const t = 1 - Math.pow(1 - progress, 3);

  state.targetY = state.snapStartY + (state.snapTargetY - state.snapStartY) * t;

  if (progress >= 1) {
    state.isSnapping = false;
    state.targetY = state.snapTargetY;
  }
};

const animate = () => {
  const now = Date.now();
  const timeSinceLastScroll = now - state.lastScrollTime;

  if (!state.isSnapping && !state.isDragging && timeSinceLastScroll > 100) {
    const snapPoint = getClosestSnapPoint();
    if (Math.abs(state.targetY - snapPoint) > 1) {
      initiateSnap();
    }
  }

  if (state.isSnapping) {
    updateSnap();
  }

  if (!state.isDragging) {
    state.currentY += (state.targetY - state.currentY) * config.LERP_FACTOR;
  }

  checkAndCreateProjects();

  state.projects.forEach((project, index) => {
    const y = index * state.projectHeight + state.currentY;
    project.style.transform = `translateY(${y}px)`;

    const parallaxImage = state.parallaxImages.get(index);
    if (parallaxImage) {
      parallaxImage.update(state.currentY);
    }
  });

  requestAnimationFrame(animate);
};

const handleWheel = (e) => {
  e.preventDefault();
  state.isSnapping = false;
  state.lastScrollTime = Date.now();

  const scrollDelta = e.deltaY * config.SCROLL_SPEED;
  state.targetY -= Math.max(
    Math.min(scrollDelta, config.MAX_VELOCITY),
    -config.MAX_VELOCITY
  );
};

const handleTouchStart = (e) => {
  state.isDragging = true;
  state.isSnapping = false;
  state.startY = e.touches[0].clientY;
  state.lastY = state.targetY;
  state.lastScrollTime = Date.now();
};

const handleTouchMove = (e) => {
  if (!state.isDragging) return;
  const deltaY = (e.touches[0].clientY - state.startY) * 1.5;
  state.targetY = state.lastY + deltaY;
  state.lastScrollTime = Date.now();
};

const handleTouchEnd = () => {
  state.isDragging = false;
};

const handleResize = () => {
  state.projectHeight = window.innerHeight;
  state.projects.forEach((project, index) => {
    project.style.transform = `translateY(${index * state.projectHeight}px)`;
    const parallaxImage = state.parallaxImages.get(index);
    if (parallaxImage) {
      parallaxImage.updateBounds();
    }
  });
};

const initializeScroll = () => {
  window.addEventListener("wheel", handleWheel, { passive: false });
  window.addEventListener("touchstart", handleTouchStart);
  window.addEventListener("touchmove", handleTouchMove);
  window.addEventListener("touchend", handleTouchEnd);
  window.addEventListener("resize", handleResize);

  createInitialProjects();
  animate();
};

document.addEventListener("DOMContentLoaded", initializeScroll);

// Nav
const nav = document.querySelector(".nav-wrapper");
const navLinks = document.querySelectorAll(".nav-links");
const isMobile = window.innerWidth < 530;

// Nav-Menu
document.addEventListener("DOMContentLoaded", function () {
  const nav = document.querySelector(".nav-wrapper");
  const navMenu = document.querySelector(".nav-bottom");
  const navTop = document.querySelector(".nav-top");
  const navPage = document.querySelectorAll(".nav-page .ofh p");
  const navLink = document.querySelectorAll(".nav-links .ofh p");
  const icon = document.querySelector(".hamburger i");
  const navDisplay = document.querySelector(".nav-display");

  let isOpen = false;

  gsap.set(nav, { height: "3rem" });
  gsap.set(navTop, { display: "none" });
  gsap.set(navPage, { y: "150%" });
  gsap.set(navLink, { y: "150%" });

  navMenu.addEventListener("click", function () {
    if (isOpen) {
      !isMobile
        ? gsap.to(nav, {
            height: "34.5rem",
            duration: 0.75,
            ease: "power4.inOut",
            immediateRender: false,
          })
        : gsap.to(nav, {
            height: "27.5rem",
            duration: 0.75,
            ease: "power4.inOut",
            immediateRender: false,
          });

      gsap.to(navTop, {
        duration: 0.1,
        onStart: function () {
          gsap.set(navTop, { display: "flex" });
        },
        delay: 0.5,
        immediateRender: false,
      });

      gsap.to(navPage, {
        y: "0%",
        duration: 1,
        ease: "power4.out",
        stagger: 0.075,
        delay: 0.6,
        immediateRender: false,
      });

      gsap.to(navLink, {
        y: "0%",
        duration: 1,
        ease: "power4.out",
        stagger: 0.075,
        delay: 0.6,
        immediateRender: false,
      });

      gsap.to(navMenu, {
        duration: 0.5,
        ease: "power4.inOut",
        delay: 0,
        immediateRender: false,
        onComplete: function () {
          icon.className = "ph-light ph-x";
        },
      });

      gsap.to(".nav-button-wrapper span:nth-child(1)", {
        top: "100%",
        ease: "power4.inOut",
        duration: 0.75,
        delay: 0.3,
      });

      gsap.to(".nav-button-wrapper span:nth-child(2)", {
        top: "0%",
        ease: "power4.inOut",
        duration: 0.75,
        delay: 0.3,
      });
    } else {
      gsap.to(nav, {
        height: "3rem",
        duration: 1,
        ease: "power4.inOut",
        delay: 0.2,
        immediateRender: false,
      });

      gsap.to(navTop, {
        duration: 0.1,
        onComplete: function () {
          gsap.set(navTop, { display: "none" });
        },
        delay: 1,
        immediateRender: false,
      });

      gsap.to(navPage, {
        y: "150%",
        duration: 1,
        ease: "power4.out",
        stagger: 0.075,
        immediateRender: false,
      });

      gsap.to(navLink, {
        y: "150%",
        duration: 1,
        ease: "power4.out",
        stagger: 0.075,
        immediateRender: false,
      });

      gsap.to(navMenu, {
        duration: 0.2,
        ease: "power4.inOut",
        immediateRender: false,
        onComplete: function () {
          icon.className = "ph-light ph-list";
        },
      });

      gsap.to(".nav-button-wrapper span:nth-child(1)", {
        top: "0%",
        ease: "power4.inOut",
        duration: 0.75,
        delay: 0.3,
      });

      gsap.to(".nav-button-wrapper span:nth-child(2)", {
        top: "100%",
        ease: "power4.inOut",
        duration: 0.75,
        delay: 0.3,
      });
    }
    isOpen = !isOpen;
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const linkItems = document.querySelectorAll(".nav-page");

  linkItems.forEach((item) => {
    const copyElements = item.querySelectorAll(".ofh");

    copyElements.forEach((a) => {
      const copy = a.querySelector("p");

      if (copy) {
        const duplicateCopy = document.createElement("p");
        duplicateCopy.textContent = copy.textContent;
        a.appendChild(duplicateCopy);
      }
    });
  });

  document.querySelectorAll(".nav-page").forEach((item) => {
    item.addEventListener("mouseover", () => {
      mouseOverAnimation(item);
    });

    item.addEventListener("mouseout", () => {
      mouseOutAnimation(item);
    });
  });

  const mouseOverAnimation = (elem) => {
    gsap.to(elem.querySelectorAll("p:nth-child(1)"), {
      top: "-100%",
      duration: 0.3,
    });
    gsap.to(elem.querySelectorAll("p:nth-child(2)"), {
      top: "0%",
      duration: 0.3,
    });
  };

  const mouseOutAnimation = (elem) => {
    gsap.to(elem.querySelectorAll("p:nth-child(1)"), {
      top: "0%",
      duration: 0.3,
    });
    gsap.to(elem.querySelectorAll("p:nth-child(2)"), {
      top: "100%",
      duration: 0.3,
    });
  };
});

const navContact = document.querySelector(".nav-contact a");
const navIn = document.querySelector("nav");
navContact.addEventListener("mouseenter", () => {
  gsap.to(navContact, {
    duration: 0.5,
    opacity: 0.5,
  });

  gsap.to(".cursor", {
    opacity: 0,
    duration: 1,
    ease: "power4.out",
  });
});

navIn.addEventListener("mouseenter", () => {
  gsap.to(".cursor", {
    opacity: 0,
    duration: 1,
    ease: "power4.out",
  });
});

navIn.addEventListener("mouseleave", () => {
  gsap.to(".cursor", {
    opacity: 1,
    duration: 1,
    ease: "power4.out",
  });
});

navContact.addEventListener("mouseleave", () => {
  gsap.to(navContact, {
    duration: 0.5,
    opacity: 1,
  });

  gsap.to(".cursor", {
    opacity: 1,
    duration: 1,
    ease: "power4.out",
  });
});
