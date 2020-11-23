let angleSlider;
let radiusSlider;
let colors = ["#2ecc71","#3498db","#9b59b6","#f1c40f","#e67e22","#e74c3c"];
let colorSlider;
let dotsInput;
let canvas;
let liveDrawing;
let backgroundColor = "#273748";
let angleAnimation={
  angle: 0,
  from: 0,
  to: 0,
  step: 0,
  enabled: false,
  paused: false,
  displayOutput: document.getElementById("angle-current-value"),
  checkbox: document.getElementById("chk-angle-animation")
}
let colorAnimation={
  from: 0,
  to: 0,
  step: 0,
  frequency: 0,
  enabled: false,
  paused: false,
  checkbox: document.getElementById("chk-colors-animation")
}

function setup()
{
  let cw = document.getElementsByClassName("main-container")[0];
  let sn = document.getElementById("side-nav");
  //console.log(cw.clientWidth,sn.clientWidth,cw.clientWidth-sn.clientWidth);
  canvas = createCanvas(floor(cw.clientWidth -sn.clientWidth ),sn.clientHeight );
  canvas.parent("canvas-wrapper");
  angleMode(DEGREES);
  initColorList();
  angleSlider = document.getElementById("main-angle");
  radiusSlider = document.getElementById("main-radius");
  colorSlider = document.getElementById("main-color");
  dotsInput = document.getElementById("main-dot-count");

  document.getElementById("btn-add-color").addEventListener("click",addColor);

  for(let e of document.getElementsByTagName("input"))
  {
    e.addEventListener("input",draw);
  }

  setliveDrawing(false);

  document.getElementById("btn-save-image").addEventListener("click",()=>{
    saveCanvas();
  });
  //https://www.youtube.com/watch?v=xmV-JvvMFQ8&feature=emb_logo
  document.getElementById("btn-save-gif").addEventListener("click",()=>{
    //todo
  });

  angleAnimation.checkbox.addEventListener("click",animateAngle);

  document.getElementById("chk-angle-animation-pause").addEventListener("click",(event)=>{
    angleAnimation.paused = event.target.checked;
  });

  colorAnimation.checkbox.addEventListener("click",animateColor);

  document.getElementById("chk-colors-animation-pause").addEventListener("click",(event)=>{
    colorAnimation.paused = event.target.checked;
  });

  let bgcolor = document.getElementById("input-background-color");
  bgcolor.value = "#273748";
  bgcolor.addEventListener("input",(event)=>
  {
    if(event.target.value.match("^#([a-fA-F0-9]{8}|[a-fA-F0-9]{6}|[a-fA-F0-9]{4}|[a-fA-F0-9]{3})$") != null)
    {
      backgroundColor = event.target.value;
      draw();
    }
  })
}

// OPTIMIZE: stop drawing this stuff all the god damn time
// dodać linnie zamiast kropek jako opcję
function draw()
{
  push();
  background(backgroundColor);
  noStroke();
  translate(width/2,height/2);
  let index = 0;
  let angle = angleAnimation.enabled ? angleAnimation.angle : parseFloat(angleSlider.value);
  let frequency = colorAnimation.enabled ? parseInt(colorAnimation.frequency) : parseFloat(colorSlider.value);
  for(let n = 0;n<dotsInput.value;n++)
  {
    fill(colors[index%colors.length]);
    ellipseMode(CENTER);
    let fi = n * angle;
    let radius = parseInt(radiusSlider.value) * sqrt(n);
    ellipse(cos(fi)*radius,sin(fi)*radius,8,8);
    if(n%frequency==0)index++;

    // let fi2 = (n+1)* angle;
    // strokeWeight(8);
    // stroke(colors[index%colors.length]);
    // line(cos(fi)*radius,sin(fi)*radius,cos(fi2)*radius,sin(fi2)*radius);

    if(angleAnimation.enabled && !angleAnimation.paused)
    {
      angleAnimation.angle = angleAnimation.angle > angleAnimation.to ? angleAnimation.from : angleAnimation.angle+angleAnimation.step;

    }
  }
  angleAnimation.displayOutput.innerText = angleAnimation.angle.toFixed(3)+"\u00B0";
  if(colorAnimation.enabled && !colorAnimation.paused)
  {
    colorAnimation.frequency = colorAnimation.frequency > colorAnimation.to ? colorAnimation.from : colorAnimation.frequency+colorAnimation.step;
  }
  pop();
}

window.addEventListener("resize",()=>{
  let cw = document.getElementsByClassName("main-container")[0];
  let sn = document.getElementById("side-nav");
  console.log(sn.clientHeight);
   canvas.resize(floor(cw.clientWidth -sn.clientWidth ),sn.clientHeight );
   if(!liveDrawing)draw();
});

function initColorList()
{
  let template = document.getElementById("color-list-item-template");
  let sn = template.parentElement;
  for(i=0;i<colors.length;i++)
  {
    let clone = template.content.cloneNode(true);
    let smi = clone.children[0].children;
    smi[0].children[0].value = colors[i];
    smi[1].children[0].style.backgroundColor = colors[i];
    smi[2].addEventListener("click",removeColor);
    sn.appendChild(clone);
  }

  for(let i of document.getElementsByClassName("color-input"))
  {
    i.oldValue = i.value;
    i.addEventListener("change",updateColor);
    i.addEventListener("focus",(event) => {
      event.target.oldValue = event.target.value;
    });
  }
}
// there is a bug somewhere but i cant find it
function updateColor(event)
{
  console.log(event.target.value);
  console.log(event.target.oldValue);
  if(event.target.value.match("^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$") != null)
  {
    if(event.target.oldValue!="")
    {
      let index = colors.findIndex((c) => {return c == event.target.oldValue});
      colors.splice(index,1);
    }
    else event.target.oldValue = event.target.value;
    colors.push(event.target.value);
    event.target.parentElement.nextElementSibling.children[0].style.backgroundColor = event.target.value;
    if(!liveDrawing)draw();
  }
}

function addColor()
{
  let template = document.getElementById("color-list-item-template");
  let sn = template.parentElement;
  let clone = template.content.cloneNode(true);
  let smi = clone.children[0].children;

  smi[2].addEventListener("click",removeColor);
  sn.appendChild(clone);

  smi[0].children[0].addEventListener("change",updateColor);
  smi[0].children[0].addEventListener("focus",(event) => {
    event.target.oldValue = event.target.value;
  });
}

function removeColor(event)
{
  let input = event.target.parentElement.parentElement.children[0].children[0] || event.target.parentElement.children[0].children[0];
  if(input.value.match("^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$") != null)
  {
    let index = colors.findIndex((c) => {return c == input.value});
    console.log(index);

    colors.splice(index,1);
  }
  if(event.target.children.length==0) event.target.parentElement.parentElement.remove()
  else event.target.parentElement.remove()
  if(!liveDrawing)draw();
}
function setliveDrawing(value)
{
  //isLooping()
  if(!value && (angleAnimation.checkbox.checked || colorAnimation.checkbox.checked)) return;
  liveDrawing = value;
  if(!liveDrawing) noLoop();
  else loop();
}

function animateAngle(event)
{
  // can be optimized i think
  if(event.target.checked)
  {
    let from = parseFloat(document.getElementById("input-angle-from").value);
    let to = parseFloat(document.getElementById("input-angle-to").value);
    let step = parseFloat(document.getElementById("input-angle-step").value);
    if(Number.isFinite(from) && Number.isFinite(to) && Number.isFinite(step) && to > from)
    {
      angleAnimation.from = from;
      angleAnimation.to = to;
      angleAnimation.step = step;
      angleAnimation.angle = from;
      angleAnimation.enabled = true;
      setliveDrawing(true);
    }
  }
  else
  {
    angleAnimation.enabled = false;
    setliveDrawing(false);
  }
}

function animateColor(event)
{
  // can be optimized i think
  if(event.target.checked)
  {
    let from = parseFloat(document.getElementById("input-colors-from").value);
    let to = parseFloat(document.getElementById("input-colors-to").value);
    let step = parseFloat(document.getElementById("input-colors-step").value);
    if(Number.isFinite(from) && Number.isFinite(to) && Number.isFinite(step) && to > from)
    {
      colorAnimation.from = from;
      colorAnimation.to = to;
      colorAnimation.step = step;
      colorAnimation.frequency = from;
      colorAnimation.enabled = true;
      setliveDrawing(true);
    }
  }
  else
  {
    colorAnimation.enabled = false;
    setliveDrawing(false);
  }
}
