figma.showUI(__html__, {
  width: 280,
  height: 620
});

// --------------------------------------------------
// Counters
// --------------------------------------------------

const counters = {
  textView: 0,
  imageView: 0,
  qrView: 0,
  view: 0,
  screen: 0
};

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function getTargetParent() {

  const selection = figma.currentPage.selection;

  if (
    selection.length === 1 &&
    selection[0].type === 'FRAME'
  ) {
    return selection[0];
  }

  return figma.currentPage;
}

function getCenterPosition(width, height) {

  const center = figma.viewport.center;

  return {
    x: center.x - width / 2,
    y: center.y - height / 2
  };
}

function applyDefaultStyle(node) {

  node.fills = [
    {
      type: 'SOLID',
      color: {
        r: 0.95,
        g: 0.95,
        b: 0.95
      }
    }
  ];

  node.strokes = [
    {
      type: 'SOLID',
      color: {
        r: 0.75,
        g: 0.75,
        b: 0.75
      }
    }
  ];

  node.strokeWeight = 1;
}

function appendNode(node) {

  const parent = getTargetParent();

  parent.appendChild(node);

  if (parent.type === 'PAGE') {

    const pos = getCenterPosition(
      node.width,
      node.height
    );

    node.x = pos.x;
    node.y = pos.y;
  }
  else {

    node.x = 20;
    node.y = 20;
  }

  figma.currentPage.selection = [node];

  figma.viewport.scrollAndZoomIntoView([node]);
}

function createBaseFrame(name, width, height) {

  const frame = figma.createFrame();

  frame.name = name;

  frame.resize(width, height);

  applyDefaultStyle(frame);

  return frame;
}

// --------------------------------------------------
// TextView
// --------------------------------------------------

async function createTextView(textValue) {

  counters.textView++;

  await figma.loadFontAsync({
    family: 'Inter',
    style: 'Regular'
  });

  const text = figma.createText();

  text.characters =
    textValue || 'TextView';

  text.fontSize = 16;

  text.fills = [
    {
      type: 'SOLID',
      color: {
        r: 0.2,
        g: 0.2,
        b: 0.2
      }
    }
  ];

  const paddingX = 20;
  const paddingY = 12;

  const frame = createBaseFrame(
    `textView_${counters.textView}`,
    text.width + paddingX,
    text.height + paddingY
  );

  text.x = paddingX / 2;
  text.y = paddingY / 2;

  frame.appendChild(text);

  appendNode(frame);
}

// --------------------------------------------------
// ImageView
// --------------------------------------------------

function createImageView(imageBytes) {

  counters.imageView++;

  const image = figma.createImage(
    new Uint8Array(imageBytes)
  );

  const rect = figma.createRectangle();

  rect.resize(160, 120);

  rect.name =
    `imageView_${counters.imageView}`;

  rect.fills = [
    {
      type: 'IMAGE',
      imageHash: image.hash,
      scaleMode: 'FILL'
    }
  ];

  appendNode(rect);
}

// --------------------------------------------------
// QRView
// --------------------------------------------------

function createQRView(imageBytes) {

  counters.qrView++;

  const image = figma.createImage(
    new Uint8Array(imageBytes)
  );

  const rect = figma.createRectangle();

  rect.resize(100, 100);

  rect.name =
    `qrView_${counters.qrView}`;

  rect.fills = [
    {
      type: 'IMAGE',
      imageHash: image.hash,
      scaleMode: 'FILL'
    }
  ];

  appendNode(rect);
}

// --------------------------------------------------
// View
// --------------------------------------------------

function createView() {

  counters.view++;

  const frame = createBaseFrame(
    `view_${counters.view}`,
    160,
    120
  );

  appendNode(frame);
}

// --------------------------------------------------
// Screen Presets
// --------------------------------------------------

function createScreen(width, height) {

  counters.screen++;

  const frame = figma.createFrame();

  frame.name =
    `screen_${width}x${height}_${counters.screen}`;

  frame.resize(width, height);

  frame.fills = [
    {
      type: 'SOLID',
      color: {
        r: 1,
        g: 1,
        b: 1
      }
    }
  ];

  frame.strokes = [
    {
      type: 'SOLID',
      color: {
        r: 0.2,
        g: 0.2,
        b: 0.2
      }
    }
  ];

  frame.strokeWeight = 2;

  appendNode(frame);
}

// --------------------------------------------------
// Message Handler
// --------------------------------------------------

figma.ui.onmessage = async (msg) => {

  switch (msg.type) {

    case 'create-textview':

      await createTextView(
        msg.text
      );

      break;

    case 'create-imageview':

      createImageView(
        msg.imageData
      );

      break;

    case 'create-qrview':

      createQRView(
        msg.imageData
      );

      break;

    case 'create-view':

      createView();

      break;

    case 'create-screen':

      createScreen(
        msg.width,
        msg.height
      );

      break;
  }
};