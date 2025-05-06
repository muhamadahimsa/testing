// Lenis
gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(Draggable);

const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// Hero
// variables
const imageContainer = document.getElementById("imageContainer");
const imageElement = document.getElementById("myImage");

let easeFactor = 0.02;
let scene, camera, renderer, planeMesh;
let mousePosition = { x: 0.5, y: 0.5 };
let targetMousePosition = { x: 0.5, y: 0.5 };
let mouseStopTimeout;
let aberrationIntensity = 0.0;
let lastPosition = { x: 0.5, y: 0.5 };
let prevPosition = { x: 0.5, y: 0.5 };

// shaders
const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    varying vec2 vUv;
    uniform sampler2D u_texture;    
    uniform vec2 u_mouse;
    uniform vec2 u_prevMouse;
    uniform float u_aberrationIntensity;

    void main() {
        vec2 gridUV = floor(vUv * vec2(80.0, 80.0)) / vec2(80.0, 80.0);
        vec2 centerOfPixel = gridUV + vec2(1.0/80.0, 1.0/80.0);
        
        vec2 mouseDirection = u_mouse - u_prevMouse;
        
        vec2 pixelToMouseDirection = centerOfPixel - u_mouse;
        float pixelDistanceToMouse = length(pixelToMouseDirection);
        float strength = smoothstep(0.3, 0.0, pixelDistanceToMouse);
 
        vec2 uvOffset = strength * - mouseDirection * 0.2;
        vec2 uv = vUv - uvOffset;

        vec4 colorR = texture2D(u_texture, uv + vec2(strength * u_aberrationIntensity * 0.01, 0.0));
        vec4 colorG = texture2D(u_texture, uv);
        vec4 colorB = texture2D(u_texture, uv - vec2(strength * u_aberrationIntensity * 0.01, 0.0));

        gl_FragColor = vec4(colorR.r, colorG.g, colorB.b, 1.0);
    }
`;

function initializeScene(texture) {
  //   scene creation
  scene = new THREE.Scene();

  // camera setup
  camera = new THREE.PerspectiveCamera(
    50,
    imageElement.offsetWidth / imageElement.offsetHeight,
    0.01,
    10
  );
  camera.position.z = 1;

  //   uniforms
  let shaderUniforms = {
    u_mouse: { type: "v2", value: new THREE.Vector2() },
    u_prevMouse: { type: "v2", value: new THREE.Vector2() },
    u_aberrationIntensity: { type: "f", value: 0.0 },
    u_texture: { type: "t", value: texture },
  };

  //   creating a plane mesh with materials
  planeMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 1),
    new THREE.ShaderMaterial({
      uniforms: shaderUniforms,
      vertexShader,
      fragmentShader,
    })
  );

  //   add mesh to scene
  scene.add(planeMesh);

  //   render
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(imageElement.offsetWidth, imageElement.offsetHeight);

  //   create a canvas
  imageContainer.appendChild(renderer.domElement);
}

// use the existing image from html in the canvas
initializeScene(new THREE.TextureLoader().load(imageElement.src));

animateScene();

function animateScene() {
  requestAnimationFrame(animateScene);

  mousePosition.x += (targetMousePosition.x - mousePosition.x) * easeFactor;
  mousePosition.y += (targetMousePosition.y - mousePosition.y) * easeFactor;

  planeMesh.material.uniforms.u_mouse.value.set(
    mousePosition.x,
    1.0 - mousePosition.y
  );

  planeMesh.material.uniforms.u_prevMouse.value.set(
    prevPosition.x,
    1.0 - prevPosition.y
  );

  aberrationIntensity = Math.max(0.0, aberrationIntensity - 0.05);

  planeMesh.material.uniforms.u_aberrationIntensity.value = aberrationIntensity;

  renderer.render(scene, camera);
}

// event listeners
imageContainer.addEventListener("mousemove", handleMouseMove);
imageContainer.addEventListener("mouseenter", handleMouseEnter);
imageContainer.addEventListener("mouseleave", handleMouseLeave);

function handleMouseMove(event) {
  easeFactor = 0.02;
  let rect = imageContainer.getBoundingClientRect();
  prevPosition = { ...targetMousePosition };

  targetMousePosition.x = (event.clientX - rect.left) / rect.width;
  targetMousePosition.y = (event.clientY - rect.top) / rect.height;

  aberrationIntensity = 1;
}

function handleMouseEnter(event) {
  easeFactor = 0.02;
  let rect = imageContainer.getBoundingClientRect();

  mousePosition.x = targetMousePosition.x =
    (event.clientX - rect.left) / rect.width;
  mousePosition.y = targetMousePosition.y =
    (event.clientY - rect.top) / rect.height;
}

function handleMouseLeave() {
  easeFactor = 0.05;
  targetMousePosition = { ...prevPosition };
}

// Others
document.querySelectorAll(".other-project").forEach((item) => {
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

// Footer //
const initScrollTrigger = () => {
  const hero = document.querySelector(".hero");
  const images = document.querySelectorAll(".parallax-img img");

  gsap.utils.toArray(images).forEach((image) => {
    gsap.set(image, { scale: 1.2 });

    const imageRect = image.getBoundingClientRect();
    const heightDifference =
      imageRect.height - image.parentElement.offsetHeight;

    gsap.fromTo(
      image,
      {
        y: -heightDifference,
      },
      {
        scrollTrigger: {
          trigger: image,
          start: "top center+=30%",
          end: "bottom+=10% top",
          scrub: true,
        },
        y: heightDifference,
        ease: "none",
      }
    );
  });
};

document.addEventListener("DOMContentLoaded", function () {
  const linkItems = document.querySelectorAll(".footer-link");

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

  document.querySelectorAll(".footer-link .ofh").forEach((item) => {
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

window.onload = () => {
  initScrollTrigger();
};

const otherProjects = document.querySelectorAll(".other-project");

// Nav
const nav = document.querySelector(".nav-wrapper");
const navLinks = document.querySelectorAll(".nav-links");
const isMobile = window.innerWidth < 530;

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
