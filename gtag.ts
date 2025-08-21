// ii's Quest Menu, by @goldentrophy / @crimsoncauldron
// Warning: Ugly code. I hate TypeScript.

declare const Il2Cpp: any;
declare const console: any;
declare const XRNode: any;

let framecount = 0;
let timeUntilCanPressAgain = 0.0;
let menu = null;

let previousGhostKey = false;
let previousInvisKey = false;
let previousNoclipKey = false;

let leftPlatform = null;
let rightPlatform = null;

const ControllerInputPoller = Il2Cpp.domain.assembly("Assembly-CSharp").image.class("ControllerInputPoller").new();

const bgColor: [number, number, number, number] = [0.0, 0.0, 1.0, 1.0];
const textColor: [number, number, number, number] = [1.0, 1.0, 1.0, 1.0];

const buttonColor: [number, number, number, number] = [0.0, 0.0, 0.0, 1.0];
const buttonPressedColor: [number, number, number, number] = [0.0, 0.0, 1.0, 1.0];

Il2Cpp.perform(() => {
  const GorillaTaggerClass = Il2Cpp.domain.assembly("Assembly-CSharp").image.class("GorillaTagger");
  const VRRigClass = Il2Cpp.domain.assembly("Assembly-CSharp").image.class("VRRig");
  const NetworkSystemClass = Il2Cpp.domain.assembly("Assembly-CSharp").image.class("NetworkSystem");
  const GameModeSelectButton = Il2Cpp.domain.assembly("Assembly-CSharp").image.class("GameModeSelectButton");

  const GameObject = Il2Cpp.domain.assembly("UnityEngine.CoreModule").image.class("UnityEngine.GameObject");
  const Object = Il2Cpp.domain.assembly("UnityEngine.CoreModule").image.class("UnityEngine.Object");
  const Vector3 = Il2Cpp.domain.assembly("UnityEngine.CoreModule").image.class("UnityEngine.Vector3");
  const Quaternion = Il2Cpp.domain.assembly("UnityEngine.CoreModule").image.class("UnityEngine.Quaternion");
  const Time = Il2Cpp.domain.assembly("UnityEngine.CoreModule").image.class("UnityEngine.Time");
  const Resources = Il2Cpp.domain.assembly("UnityEngine.CoreModule").image.class("UnityEngine.Resources");

  const Material = Il2Cpp.domain.assembly("UnityEngine.CoreModule").image.class("UnityEngine.Material");
  const Renderer = Il2Cpp.domain.assembly("UnityEngine.CoreModule").image.class("UnityEngine.Renderer");
  const Shader = Il2Cpp.domain.assembly("UnityEngine.CoreModule").image.class("UnityEngine.Shader");
  const Color = Il2Cpp.domain.assembly("UnityEngine.CoreModule").image.class("UnityEngine.Color");

  const MeshCollider = Il2Cpp.domain.assembly("UnityEngine.PhysicsModule").image.class("UnityEngine.MeshCollider");
  const BoxCollider = Il2Cpp.domain.assembly("UnityEngine.PhysicsModule").image.class("UnityEngine.BoxCollider");
  const Collider = Il2Cpp.domain.assembly("UnityEngine.PhysicsModule").image.class("UnityEngine.Collider");
  const Canvas = Il2Cpp.domain.assembly("UnityEngine.UIModule").image.class("UnityEngine.Canvas");
  const CanvasScaler = Il2Cpp.domain.assembly("UnityEngine.UI").image.class("UnityEngine.UI.CanvasScaler");
  const RectTransform = Il2Cpp.domain.assembly("UnityEngine.CoreModule").image.class("UnityEngine.RectTransform");
  const GraphicRaycaster = Il2Cpp.domain.assembly("UnityEngine.UI").image.class("UnityEngine.UI.GraphicRaycaster");
  const Text = Il2Cpp.domain.assembly("UnityEngine.UI").image.class("UnityEngine.UI.Text");
  const Font = Il2Cpp.domain.assembly("UnityEngine.TextRenderingModule").image.class("UnityEngine.Font");

  const GorillaTagger = GorillaTaggerClass.field("_instance").value;
  const NetworkSystem = NetworkSystemClass.field("Instance").value;
  const rigidbody = GorillaTagger.field("<rigidbody>k__BackingField").value;

  const LocalRig = GorillaTagger.field("offlineVRRig").value;

  const update = ControllerInputPoller.method("Update");
  const UberShader = Shader.method("Find").invoke(Il2Cpp.string("GorillaTag/UberShader"));

  const zeroVector = Vector3.field("zeroVector").value;
  const oneVector = Vector3.field("oneVector").value;
  const identityQuaternion = Quaternion.field("identityQuaternion").value

  const arial = Resources
    .method("GetBuiltinResource", 1) 
    .inflate(Font)                   
    .invoke(Il2Cpp.string("Arial.ttf"));
   
  function Destroy(object){
    Object.method("Destroy", 1).invoke(object);
  }

  function getComponent(obj: any, type) {
    return obj.method("GetComponent", 1).inflate(type).invoke();
  }

  function addComponent(obj: any, type) {
    return obj.method("AddComponent", 1).inflate(type).invoke();
  }

  function getTransform(obj: any){
    return obj.method("get_transform").invoke();
  }

  function renderMenuText(
    canvasObject,
    text: string = "",
    color: [number, number, number, number] = [1, 1, 1, 1],
    pos = zeroVector,
    size = oneVector
  ){
    const title = addComponent(createObject(zeroVector, identityQuaternion, oneVector, 3, [0, 0, 0, 0], getTransform(canvasObject)), Text);
    title.method("set_text").invoke(Il2Cpp.string(text));
    title.method("set_font").invoke(arial);
    title.method("set_fontSize").invoke(1);
    title.method("set_color").invoke(color);
    title.method("set_fontStyle").invoke(2);
    title.method("set_alignment").invoke(4);
    title.method("set_resizeTextForBestFit").invoke(true);
    title.method("set_resizeTextMinSize").invoke(0);

    const rectTransform = getComponent(title, RectTransform);
    rectTransform.method("set_sizeDelta").invoke(size);
    rectTransform.method("set_position").invoke(pos);
    rectTransform.method("set_rotation").invoke(Quaternion.method("Euler").invoke(180.0, 90.0, 90.0))
  }

  function createObject(
  pos = zeroVector, 
  rot = identityQuaternion, 
  scale = oneVector, 
  primitiveType: number = 3, 
  colorArr: [number, number, number, number] = [1, 1, 1, 1],
  parent = null
  ) {
    const obj = GameObject.method("CreatePrimitive").invoke(primitiveType);

    const renderer = getComponent(obj, Renderer);
    
    if (colorArr[3] == 0){
      renderer.method("set_enabled").invoke(false);
    } else {
      const material = renderer.method("get_material").invoke();
      material.method("set_shader").invoke(UberShader);
      material.method("set_color").invoke(colorArr); 
    }
    
    const transform = getTransform(obj); 
    if (parent != null){
      transform.method("SetParent", 2).invoke(parent, false);
    }

    transform.method("set_position").invoke(pos);
    transform.method("set_rotation").invoke(rot);
    transform.method("set_localScale").invoke(scale);

    return obj;
  }

  function renderMenu(){
    menu = createObject(zeroVector, identityQuaternion, [0.1, 0.3, 0.3825], 3, [0, 0, 0, 0]);
    Destroy(getComponent(menu, BoxCollider))

    const menuBackground = createObject([0.1, 0, 0], identityQuaternion, [0.1, 1, 1], 3, bgColor, getTransform(menu))
    Destroy(getComponent(menuBackground, BoxCollider))

    const canvasObject = createObject(zeroVector, identityQuaternion, oneVector, 3, [0, 0, 0, 0], getTransform(menu));
    const canvas = addComponent(canvasObject, Canvas);
    Destroy(getComponent(canvasObject, BoxCollider))

    const canvasScaler = addComponent(canvasObject, CanvasScaler);
    addComponent(canvasObject, GraphicRaycaster);
    canvas.method("set_renderMode").invoke(2);
    canvasScaler.method("set_dynamicPixelsPerUnit").invoke(1000.0);

    renderMenuText(canvasObject, "ii's <b>Quest</b> Menu", textColor, [0.11, 0, 0.175], [1, 0.1]);

    const disconnectButton = createObject([0.1, 0.0, 0.225], identityQuaternion, [0.09, 0.9, 0.08], 3, buttonColor, getTransform(menu));
    disconnectButton.method("set_name").invoke(Il2Cpp.string("Disconnect"));
    renderMenuText(canvasObject, "Disconnect", textColor, [0.11, 0, 0.225], [1, 0.1]);
    addComponent(disconnectButton, GameModeSelectButton);
    disconnectButton.method("set_layer").invoke(18);

    let i = 0;
    for (const mod in buttons) {
      const button = createObject([0.105, 0, 0.13 - (i * 0.04)], identityQuaternion, [0.09, 0.9, 0.08], 3, buttonColor, getTransform(menu));
      button.method("set_name").invoke(Il2Cpp.string(mod));
      button.method("set_layer").invoke(18);

      addComponent(button, GameModeSelectButton);
      renderMenuText(canvasObject, mod, textColor, [0.11, 0, 0.13 - (i * 0.04)], [1, 0.1]);
      updateButtonColor(button);
      i++;
    };

    recenterMenu();
  }

  function recenterMenu(){
    const leftHandTransform = GorillaTagger.field("leftHandTransform").value
    let menuPosition = leftHandTransform.method("get_position").invoke();
    let menuRotation = leftHandTransform.method("get_rotation").invoke();
    
    menuRotation = Quaternion.method("op_Multiply", 2).invoke(menuRotation, Quaternion.method("Euler").invoke(-45, 0, 0))

    const menuTransform = getTransform(menu);
    menuTransform.method("set_position").invoke(menuPosition);
    menuTransform.method("set_rotation").invoke(menuRotation);
  }

  function updateButtonColor(button) {
    // Make sure Renderer class is resolved
    const RendererClass = Il2Cpp.domain
        .assembly("UnityEngine.CoreModule")
        .image
        .class("UnityEngine.Renderer");

    const renderer = getComponent(button, RendererClass);
    if (!renderer) {
        return;
    }

    const rawName = button.method("get_name").invoke().toString();
    const buttonName = rawName.substring(1, rawName.length - 1);

    if (!(buttonName in buttons)) {
        return;
    }

    const material = renderer.method("get_material").invoke();
    material.method("set_color").invoke(buttons[buttonName].enabled ? buttonPressedColor : buttonColor); 
  }

  function playButtonSound(){
    LocalRig.field("leftHandPlayer").value.method("Stop").invoke(false);
    LocalRig.field("rightHandPlayer").value.method("Stop").invoke(false);

    for (let i = 0; i < 10; i++) {
      LocalRig.method("PlayHandTapLocal").invoke(66, false, 1);
    }
  }

  function toggleColliders(enabled){
    const meshColliders = Object.method("FindObjectsOfType").inflate(MeshCollider).invoke();
    
    console.log(meshColliders.length);
    for (let i = 0; i < meshColliders.length; i++) {
        const meshCollider = meshColliders.get(i); // or meshColliders.at(i)
        meshCollider.method("set_enabled").invoke(enabled);
    }
  }

  const buttons = {
    "Platforms": {
      enabled: false,
      enableAction: () => {

      },
      disableAction: () => {

      }
    },
    "Fly": {
      enabled: false,
      enableAction: () => {

      },
      disableAction: () => {

      }
    },
    "Noclip": {
      enabled: false,
      enableAction: () => {

      },
      disableAction: () => {

      }
    },
    "Long Arms": {
      enabled: false,
      enableAction: () => {
        getTransform(GorillaTagger).method("set_localScale").invoke([1.5, 1.5, 1.5]);
      },
      disableAction: () => {
        getTransform(GorillaTagger).method("set_localScale").invoke(oneVector);
      }
    },
    "Ghost": {
      enabled: false,
      enableAction: () => {

      },
      disableAction: () => {

      }
    },
    "Invisible": {
      enabled: false,
      enableAction: () => {

      },
      disableAction: () => {

      }
    },
    "Head Spaz": {
      enabled: false,
      enableAction: () => {

      },
      disableAction: () => {
        const trackingRotationOffset = LocalRig.field("head").value.field("trackingRotationOffset").value;
        trackingRotationOffset.field("x").value = 0.0;
        trackingRotationOffset.field("y").value = 0.0;
        trackingRotationOffset.field("z").value = 0.0;
      }
    },
    "Iron Monke": {
      enabled: false,
      enableAction: () => {

      },
      disableAction: () => {

      }
    }
  };
  
  const buttonMethod = GameModeSelectButton.method("ButtonActivation");
  buttonMethod.implementation = function () {
    const rawName = this.method("get_name").invoke().toString();
    const goName = rawName.substring(1, rawName.length - 1);
    
    const timetime = Time.method("get_time").invoke();
    
    if (timetime > timeUntilCanPressAgain){
      timeUntilCanPressAgain = timetime + 0.2;
      if (goName == "Disconnect"){
        NetworkSystem.method("ReturnToSinglePlayer").invoke();
        playButtonSound();
        return;
      }
      if (goName in buttons) {
        buttons[goName].enabled = !buttons[goName].enabled;

        if (buttons[goName].enabled){
          buttons[goName].enableAction();
        } else {
          buttons[goName].disableAction();
        }

        updateButtonColor(this);
        
        playButtonSound();
        return;
      }
    }
  };

  VRRigClass.method("OnDisable").implementation = function () {
    if (this.toString().includes("Local")){
      return;
    }
  }

  update.implementation = function () {
    framecount += 1;

    const leftPrimary = ControllerInputPoller.field("leftControllerPrimaryButton").value;
    const leftSecondary = ControllerInputPoller.field("leftControllerSecondaryButton").value;

    const rightPrimary = ControllerInputPoller.field("rightControllerPrimaryButton").value;
    const rightSecondary = ControllerInputPoller.field("rightControllerSecondaryButton").value;

    const leftGrab = ControllerInputPoller.field("leftGrab").value;
    const rightGrab = ControllerInputPoller.field("rightGrab").value;

    const leftTrigger = ControllerInputPoller.field("leftControllerIndexFloat").value > 0.5;
    const rightTrigger = ControllerInputPoller.field("rightControllerIndexFloat").value > 0.5;

    const deltaTime = Time.method("get_deltaTime").invoke();

    if (leftSecondary)
    {
      if (menu == null)
      {
        renderMenu();
      } else {
        recenterMenu();
      }
    } else {
      if (menu != null){
        Object.method("Destroy", 1).invoke(menu);
        menu = null;
      }
    } 

    if (buttons["Fly"].enabled && rightPrimary) {
      rigidbody.method("set_velocity").invoke(Vector3.field("zeroVector").value);

      const transform = GorillaTagger.method("get_transform").invoke();
      let forward = getTransform(GorillaTagger.field("headCollider").value).method("get_forward").invoke();

      let position = transform.method("get_position").invoke();
      forward = Vector3.method("op_Multiply", 2).invoke(forward, 15.0 * deltaTime);

      position = Vector3.method("op_Addition", 2).invoke(position, forward);

      transform.method("set_position").invoke(position);
    }

    if (buttons["Platforms"].enabled){ 
      if (leftGrab){
        if (leftPlatform == null){
          const handTransform = GorillaTagger.field("leftHandTransform").value;
          leftPlatform = createObject(handTransform.method("get_position").invoke(), handTransform.method("get_rotation").invoke(), [0.025, 0.15, 0.2], 3, bgColor);
        }
      } else {
        if (leftPlatform != null){
          Destroy(leftPlatform);
          leftPlatform = null;
        }
      }

      if (rightGrab){
        if (rightPlatform == null){
          const handTransform = GorillaTagger.field("rightHandTransform").value;
          rightPlatform = createObject(handTransform.method("get_position").invoke(), handTransform.method("get_rotation").invoke(), [0.025, 0.15, 0.2], 3, bgColor);
        }
      } else {
        if (rightPlatform != null){
          Destroy(rightPlatform);
          rightPlatform = null;
        }
      }
    }

    if (buttons["Ghost"].enabled){
      if (leftPrimary && !previousGhostKey){
        LocalRig.method("set_enabled").invoke(!LocalRig.method("get_enabled").invoke());
      }
      previousGhostKey = leftPrimary;
    }

    if (buttons["Invisible"].enabled){
      if (leftSecondary && !previousInvisKey){
        LocalRig.method("set_enabled").invoke(!LocalRig.method("get_enabled").invoke());
      }
      if (!LocalRig.method("get_enabled").invoke()){
        getTransform(LocalRig).method("set_position").invoke([0, -99999, 0]);
      }
      previousInvisKey = leftSecondary;
    }

    if (buttons["Noclip"].enabled){
      if (rightTrigger && !previousNoclipKey){
        toggleColliders(false);
      }

      if (!rightTrigger && previousNoclipKey){
        toggleColliders(true);
      }

      previousNoclipKey = rightTrigger;
    }

    if (buttons["Head Spaz"].enabled){
      const trackingRotationOffset = LocalRig.field("head").value.field("trackingRotationOffset").value;
      trackingRotationOffset.field("x").value = Math.random() * 360.0;
      trackingRotationOffset.field("y").value = Math.random() * 360.0;
      trackingRotationOffset.field("z").value = Math.random() * 360.0;
    }

    if (buttons["Iron Monke"].enabled){
      if (leftPrimary){
        const leftRightVector = GorillaTagger.field("leftHandTransform").value.method("get_right").invoke();
        const leftForce = Vector3.method("op_Multiply", 2).invoke(leftRightVector, -15.0 * deltaTime);
        rigidbody.method("AddForce", 2).invoke(leftForce, 2);
      }
      if (rightPrimary){
        const leftRightVector = GorillaTagger.field("rightHandTransform").value.method("get_right").invoke();
        const leftForce = Vector3.method("op_Multiply", 2).invoke(leftRightVector, 15.0 * deltaTime);
        rigidbody.method("AddForce", 2).invoke(leftForce, 2);
      }
    }

    if (framecount % 5 === 0) {
      return this.method("Update").invoke();
    } else {
      return update.invoke();
    }
  };

  console.log(`
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢀⡀⠄⠄⠄⠄⠄⣀⠄⠄⢀⡀⠄⠄⣀⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠈⣧⠄⠄⠄⠄⠄⣭⠄⠄⢨⠁⠄⠄⠏⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢤⠴⣦⢸⡏⢻⡄⠄⠄⠄⠄⣿⠄⠄⣾⠄⠄⠄⠄⠄⣟⢲⡆⠄⠄⠄⢀⡴⣄⡀⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢀⡀⢶⡛⢷⡘⣧⠄⠄⢷⠼⠇⠄⠄⠄⠄⠛⠄⠄⠛⠄⠄⠄⠄⣴⣙⡧⠄⠄⠄⢠⡾⠁⣰⠏⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢀⣀⠸⣏⠋⣈⢷⣬⠷⠙⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠈⠁⠄⠄⢠⡟⢰⣼⢃⡶⢀⡀⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠠⡄⠄⠐⣯⣭⣤⡙⡶⠟⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠉⠛⢷⡏⣠⠟⣡⢦⡀⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠄⠄⠄⢀⡤⣤⡀⠄⠳⣄⠄⠲⠞⠁⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢀⣀⣀⣀⣀⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠈⠫⣞⢙⠶⢋⣤⡀⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠻⣦⡈⠙⢶⣄⠈⠓⠄⠄⠄⠄⠄⠄⠄⠄⢀⣀⣀⣀⣤⣤⣤⣤⣶⣾⣿⣿⣿⣿⣿⣿⣿⣷⣆⡀⠄⠄⠄⠄⠄⠄⠄⠄⠄⠈⠋⣴⢸⡇⠟⠄⠄⡀⠄⠄⠄⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠙⢶⣤⡟⠄⠄⠄⠄⢀⣠⣤⣶⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⣿⣿⡟⠛⠻⢶⣤⡀⠄⠄⠄⠄⠄⠄⠄⠄⠈⠛⠁⣠⡼⠿⠁⠄⠄⠄⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠄⠄⢀⡀⠄⠄⠄⠉⠄⠄⠄⢀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡞⣿⣧⣠⣤⣤⡈⠻⣷⣄⠄⠄⠄⠄⠄⠄⠄⠄⠹⠃⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠄⢠⣟⡙⠳⢦⠄⠄⠄⠄⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⣇⢻⣿⣿⣿⣷⣬⡻⣷⡄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢀⣠⣤⣶⠾⠃⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⢀⡶⣬⣝⡳⠂⠄⠄⠄⠄⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣇⣿⣿⡌⣿⣿⣿⣿⣿⣿⣿⣿⣆⠄⠄⠄⠄⠄⠄⠄⠘⢩⡵⠿⣥⣴⡶⠆⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠘⠷⢦⣬⠇⠄⠄⠄⠄⢸⣿⣿⣿⣿⠟⠙⣿⣿⣿⣿⣿⣿⣿⣿⣄⣀⠏⠉⢻⣿⣿⣿⣿⡿⣽⣿⣿⣿⣾⡝⠻⢿⣿⣿⣿⣿⣿⣧⣄⠄⠄⠄⠄⠄⠄⠰⣾⣿⡭⣦⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢸⣿⣿⣟⠉⡧⠸⣿⣿⣿⣿⣿⣿⣿⣿⡁⠄⣱⣶⣿⣿⣿⣿⢟⣽⣿⡟⣿⣿⣿⠃⠄⠄⠉⠻⣿⣿⣿⣿⣿⣷⣄⠄⠄⠄⠄⠄⢧⡄⠷⠚⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⢠⣤⣀⣀⡀⠄⠄⠄⠄⠄⠘⣿⣿⣿⣾⣆⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⢿⣟⣯⣷⣿⣿⣿⣿⣿⣿⠃⠄⠄⠄⠄⠄⠈⠛⠿⣿⣿⣿⣿⡇⠄⠄⠄⠄⠰⠚⠛⢛⡇⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠾⣤⣬⣍⠄⠄⠄⠄⠄⠄⠄⠈⠻⣿⣿⣿⣛⣻⣿⣯⣭⣿⠿⠷⠶⣶⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠛⠁⠄⠄⠄⠄⠄⠄⠄⠄⠄⠸⣿⣿⣿⣷⠄⠄⠄⠄⠄⣛⣋⣉⣩⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⡶⠶⠶⣶⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠙⠻⢿⣿⣟⣿⡏⠄⠄⣶⣦⣤⣀⡈⠉⠙⠛⠛⠛⠋⠉⠁⠄⠄⠄⠄⠄⠄⠄⠄⣀⣀⣀⣤⣤⣿⣿⣿⡏⠄⠄⠄⠄⠄⣿⣤⣤⣤⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠛⠓⠒⠛⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠉⢉⠉⠄⠄⠄⢿⣿⣿⣿⣿⣷⣶⣦⣤⣤⣀⣀⣀⣀⣀⣀⣠⣤⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⠇⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⣿⣃⣀⣀⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠈⠉⠛⠻⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
⠄⠄⠄⢀⣀⣩⣭⡭⠶⡆⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠈⠉⠉⠛⠿⠟⠛⠛⠛⠛⠛⠛⠛⠛⠋⠉⠁⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢸⡇⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠈⠉⠘⠧⠶⠶⠃⠄⠄⠄⢤⣶⣶⣶⣶⣶⣦⣭⣭⣭⣓⣲⡀⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⢀⣀⣤⡴⠶⠂⠄⠄⠄⠹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⣀⣤⣤⣤⣶⣶⣶⣶⣶⣶⣾⠂⠄⢠⣤⣀⠄⠄⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠘⠉⠁⢀⣠⡴⠶⡄⠄⠄⠄⠘⣿⣿⣿⣿⣿⣿⣻⣿⣿⣿⣿⣿⣷⣄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠈⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠁⠄⠠⣯⡀⠉⠛⠶⣤⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠄⠈⣡⡴⠞⣋⡄⠄⠄⠄⠙⠋⠉⠁⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣧⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⣾⣿⣿⣿⣿⣿⣿⣿⠏⠄⠄⠄⠛⠶⣥⡀⠰⢦⠏⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠄⠄⠄⣶⠛⣍⡽⢆⠄⠄⠄⠄⠄⠄⠄⠄⠈⠙⢿⣿⣿⣿⣿⣿⣿⡇⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢀⣿⣿⣿⣿⣿⣿⡿⠋⠄⠄⣠⢦⡀⠴⡼⠁⠄⠄⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠈⠋⣠⠄⢋⣧⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠈⠙⠛⠿⠟⠋⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⣼⣿⣿⣿⣿⣿⠟⠄⠄⢀⣜⠓⣴⣙⡷⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠻⠶⢋⣵⠟⣠⡀⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢿⣿⣿⣿⡿⠋⠄⠄⠐⢯⣨⠗⣌⠉⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠻⣥⠞⣫⡞⢦⡀⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠈⠛⠛⠉⠄⣀⡐⠛⢦⡀⠙⠟⠁⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠸⣏⣴⠟⢴⠓⣦⡀⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⣀⣄⠺⢍⡿⣄⠈⠿⡧⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠈⠁⢶⣘⣷⠟⣠⠟⣠⢄⡄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢠⡄⠄⠄⢀⡀⠄⠄⠘⣧⠘⣧⠹⠶⠛⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠈⠛⠲⣯⣰⠏⣼⠁⠄⠄⣰⢆⡦⢤⡤⠤⠤⠤⠄⠄⠄⢸⣧⠄⣿⠙⣇⠄⠄⠄⠘⣷⠛⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠉⣘⠃⠄⢼⣀⡟⢠⡄⣼⡆⢲⢲⢠⠄⠄⠄⢸⠸⣆⢹⡦⢿⡄⠄⠄⠄⠈⠗⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠉⠄⠄⠄⠄⠁⠈⠙⠋⡇⣿⣩⢸⠄⠄⠄⠈⠄⠉⠄⠄⠈⠧⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠓⠄⠠⠼⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
`);
});
