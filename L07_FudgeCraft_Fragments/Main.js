"use strict";
var L07_FudgeCraft_Fragments;
(function (L07_FudgeCraft_Fragments) {
    var f = FudgeCore;
    window.addEventListener("load", hndLoad);
    let viewport;
    let game;
    let rotate = f.Vector3.ZERO();
    let cmpCamera;
    function hndLoad(_event) {
        const canvas = document.querySelector("canvas");
        f.RenderManager.initialize(true);
        f.Debug.log("Canvas", canvas);
        cmpCamera = new f.ComponentCamera();
        cmpCamera.pivot.translate(new f.Vector3(4, 10, 30));
        cmpCamera.pivot.lookAt(f.Vector3.ZERO());
        game = new f.Node("FudgeCraft");
        // let cube: Cube = new Cube(CUBE_TYPE.BLUE);
        let fragment = new L07_FudgeCraft_Fragments.Fragment(0);
        game.appendChild(fragment);
        fragment = new L07_FudgeCraft_Fragments.Fragment(1);
        fragment.cmpTransform.local.translateX(-10);
        game.appendChild(fragment);
        fragment = new L07_FudgeCraft_Fragments.Fragment(2);
        fragment.cmpTransform.local.translateX(-6);
        game.appendChild(fragment);
        fragment = new L07_FudgeCraft_Fragments.Fragment(3);
        fragment.cmpTransform.local.translateX(-3);
        game.appendChild(fragment);
        fragment = new L07_FudgeCraft_Fragments.Fragment(4);
        fragment.cmpTransform.local.translateX(2);
        game.appendChild(fragment);
        fragment = new L07_FudgeCraft_Fragments.Fragment(5);
        fragment.cmpTransform.local.translateX(5);
        game.appendChild(fragment);
        fragment = new L07_FudgeCraft_Fragments.Fragment(6);
        fragment.cmpTransform.local.translateX(8);
        game.appendChild(fragment);
        let cmpLight = new f.ComponentLight(new f.LightDirectional(f.Color.CSS("WHITE", 1)));
        cmpLight.pivot.lookAt(new f.Vector3(0.5, 1, 0.8));
        game.addComponent(cmpLight);
        viewport = new f.Viewport();
        viewport.initialize("Viewport", game, cmpCamera, canvas);
        f.Debug.log("Viewport", viewport);
        viewport.draw();
        f.Debug.log("Game", game);
        window.addEventListener("keydown", hndKeyDown);
    }
    function hndKeyDown(_event) {
        switch (_event.code) {
            case f.KEYBOARD_CODE.ARROW_UP:
                rotate.add(f.Vector3.X(-90));
                break;
            case f.KEYBOARD_CODE.ARROW_DOWN:
                rotate.add(f.Vector3.X(90));
                break;
            case f.KEYBOARD_CODE.ARROW_LEFT:
                rotate.add(f.Vector3.Y(-90));
                break;
            case f.KEYBOARD_CODE.ARROW_RIGHT:
                rotate.add(f.Vector3.Y(90));
                break;
            case f.KEYBOARD_CODE.A:
                cmpCamera.pivot.translation = new f.Vector3(-4, 10, -30);
                cmpCamera.pivot.lookAt(f.Vector3.ZERO());
                break;
            case f.KEYBOARD_CODE.D:
                cmpCamera.pivot.translation = new f.Vector3(4, 10, 30);
                cmpCamera.pivot.lookAt(f.Vector3.ZERO());
                break;
        }
        for (let fragment of game.getChildren()) {
            fragment.cmpTransform.local.rotation = rotate;
        }
        f.RenderManager.update();
        viewport.draw();
    }
})(L07_FudgeCraft_Fragments || (L07_FudgeCraft_Fragments = {}));
