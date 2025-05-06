gsap.registerPlugin(Draggable);

// Nav
const nav = document.querySelector(".nav-wrapper");
const navLinks = document.querySelectorAll(".nav-links");
const isMobiles = window.innerWidth < 530;

document.addEventListener("DOMContentLoaded", function () {
  const nav = document.querySelector(".nav-wrapper");
  const navMenu = document.querySelector(".nav-button");
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
      !isMobiles
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

// Project Drag
const hero = {
  section: document.querySelector(".section"),
  cards: document.querySelectorAll(".section-bg-card"),
};
const isMobile = window.matchMedia(
  "only screen and (max-width: 760px)"
).matches;

const init = () => {
  hero.cards.forEach((card, index) => {
    gsap.set(card, {
      zIndex: -index,
      clipPath: "inset(100% round 0px)",
    });
  });

  gsap.set([hero.cards[3], hero.cards[4]], { z: -2, zIndex: -15 });
  gsap.set([hero.cards[5], hero.cards[7], hero.cards[8], hero.cards[10]], {
    z: -10,
    zIndex: -10,
  });
  gsap.set([hero.cards[6], hero.cards[9]], { z: -10, zIndex: -5 });
};

const moveCards = (event) => {
  const x = event.touches ? event.touches[0].clientX : event.clientX;
  const y = event.touches ? event.touches[0].clientY : event.clientY;
  const strenght = 8;

  let xPos = (x / window.innerWidth - 0.5) * 2,
    yPos = (y / window.innerHeight - 0.5) * 2;

  gsap.to(hero.cards, {
    duration: 0.64,
    rotationY: xPos * strenght,
    rotationX: -yPos * strenght,
  });
};

const onHover = (event) => {
  gsap.to(event.target, {
    duration: 1.2,
    z: event.type === "mouseenter" ? 10 : 0,
    ease: "expo.out",
  });
};

const introAnimation = () => {
  const tl = gsap.timeline({
    defaults: { duration: 2.4, ease: "power4.inOut" },
  });

  tl.to(hero.cards, {
    z: 0,
    clipPath: "inset(0% round 0px)",
    stagger: {
      each: 0.08,
      grid: "auto",
      from: "center",
    },
  });

  tl.call(() => {
    hero.cards.forEach((card) => {
      card.addEventListener("mouseenter", onHover);
      card.addEventListener("mouseleave", onHover);
    });
    // hero.section.addEventListener("mousemove", moveCards);
    // hero.section.addEventListener("touchmove", moveCards);
  });
};

window.addEventListener("DOMContentLoaded", () => {
  init();
  introAnimation();
});

const element = document.querySelector('.section')
const items = document.querySelectorAll('.section-bg-card');

const isBounded = true;

const initDrag = () => {
  items.forEach((item, index) => {
    const itemRect = item.getBoundingClientRect(),
      itemWidth = itemRect.width,
      itemHeight = itemRect.height;

    gsap.set(item, {
      zIndex: Math.floor(Math.random() * items.length) + 1,
    })

    gsap.to(item, {
      duration: 1,
      ease: 'expo.inOut',

      onComplete: () => {
        Draggable.create(item, {
          bounds: isBounded ? element : null,
        })
      }
    })
  })
};

initDrag();

window.addEventListener('DOMContentLoaded', init);

const bgTexts = document.querySelectorAll('.section-bg-text .ofh .bg-text');
gsap.set(bgTexts, { y: '100%' });

items.forEach((item, index) => {
  item.addEventListener('mouseenter', () => {
    gsap.to(bgTexts[index], {
      y: '0%',
      ease: 'power4.out',
      duration: .5,
      stagger: .075
    })
  })

  item.addEventListener('mouseleave', () => {
    gsap.to(bgTexts[index], {
      y: '100%',
      ease: 'power4.out',
      duration: .5,
      stagger: .075
    })
  })
})