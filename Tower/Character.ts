namespace MyGame {
  import ƒ = FudgeCore;

  export enum ACTION {
    IDLE = "Idle",
    WALK = "Walk",
    JUMP = "Jump",
    JUMPSQUAT = "JumpSquat",
    JUMPSTART = "JumpStart",
    FALL = "Fall"
  }

  export enum DIRECTION {
    LEFT, RIGHT
  }

  export class Character extends Actor {
    private static readonly speedMax: ƒ.Vector2 = new ƒ.Vector2(3, 15); // units per second
    private static readonly distanceMax: ƒ.Vector2 = new ƒ.Vector2(0.1, 0.1);
    private static gravity: number = 10; //units per square second
    private static friction: number = 5 * Character.speedMax.x; // = 15 //units per square second
    private static accelerationGround: number = 10 * Character.speedMax.x; // = 30 //units per square second, used to calculate ground movement
    private static accelerationMidAir: number = 1.5 * Character.speedMax.x; // 4.5 //units per square second, used to calculate mid air movement

    public acceleration: ƒ.Vector3 = new ƒ.Vector3(0, -Character.gravity, 0);
    public speed: ƒ.Vector3 = ƒ.Vector3.ZERO();

    private posLast: ƒ.Vector3;
    private grounded: boolean;
    private jumpStart: boolean = false;

    constructor(_name: string) {
      super(_name, Character.sprites);

      let hitBox: HitBox = new HitBox("HitBoxVertical");
      hitBox.cmpTransform.local.scaleY(0.9);
      hitBox.cmpTransform.local.scaleX(0.19);
      hitBox.cmpTransform.local.translateY(0.45);
      this.hitBoxes.appendChild(hitBox);

      hitBox = new HitBox("HitBoxHorizontal");
      hitBox.cmpTransform.local.scaleY(0.7);
      hitBox.cmpTransform.local.scaleX(0.40);
      hitBox.cmpTransform.local.translateY(0.45);
      this.hitBoxes.appendChild(hitBox);

      this.animatedNodeSprite.getNodeSprite(ACTION.JUMPSQUAT).spriteFrameInterval = 2; // jumpsquat animation should last for 5 frames only
      this.animatedNodeSprite.getNodeSprite(ACTION.JUMP).spriteFrameInterval = 8;
      this.animatedNodeSprite.getNodeSprite(ACTION.IDLE).activate(true);
      this.animatedNodeSprite.registerUpdate();

      this.addEventListener(
        "animationFinished",
        (_event: Event) => {
          if (this.animatedNodeSprite.action == ACTION.JUMPSQUAT) {
            this.act(ACTION.JUMPSTART);
          } else
            if (this.grounded) {
              if (this.animatedNodeSprite.action != ACTION.IDLE)
                this.animatedNodeSprite.play(ACTION.IDLE);
            } else {
              if (this.animatedNodeSprite.action != ACTION.FALL)
                this.animatedNodeSprite.play(ACTION.FALL);
            }
        },
        true
      );
      this.animatedNodeSprite.play(ACTION.IDLE);
      this.registerUpdate();
    }

    public static generateSprites(_txtImage: ƒ.TextureImage): void {
      this.sprites = [];
      let resolutionQuad: number = 32;
      let sprite: Sprite = new Sprite(ACTION.IDLE);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(10, 0, 30, 36), 4, ƒ.Vector2.X(20), resolutionQuad, ƒ.ORIGIN2D.BOTTOMCENTER);
      this.sprites.push(sprite);

      sprite = new Sprite(ACTION.WALK);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(60, 37, 30, 36), 6, ƒ.Vector2.X(20), resolutionQuad, ƒ.ORIGIN2D.BOTTOMCENTER);
      this.sprites.push(sprite);

      sprite = new Sprite(ACTION.JUMPSQUAT);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(10, 74, 30, 36), 2, ƒ.Vector2.X(20), resolutionQuad, ƒ.ORIGIN2D.BOTTOMCENTER);
      this.sprites.push(sprite);

      sprite = new Sprite(ACTION.JUMP);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(110, 74, 30, 36), 6, ƒ.Vector2.X(20), resolutionQuad, ƒ.ORIGIN2D.BOTTOMCENTER);
      this.sprites.push(sprite);

      sprite = new Sprite(ACTION.FALL);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(410, 74, 30, 36), 2, ƒ.Vector2.X(20), resolutionQuad, ƒ.ORIGIN2D.BOTTOMCENTER);
      this.sprites.push(sprite);
    }

    public get hitBoxVertical(): HitBox {
      return <HitBox>this.hitBoxes.getChildrenByName("HitBoxVertical")[0];
    }

    public get hitBoxHorizontal(): HitBox {
      return <HitBox>this.hitBoxes.getChildrenByName("HitBoxHorizontal")[0];
    }

    public act(_action: ACTION, _direction?: DIRECTION): void {
      // console.log(_action);
      switch (_action) {
        case ACTION.IDLE:
          if (this.grounded) {
            if (Math.abs(this.speed.x) < 0.1) {
              this.speed.x = 0;
              this.acceleration.x = 0;
            } else
              this.acceleration.x = -this.speed.x * Character.friction;
          }
          else
            this.acceleration.x = 0;
          break;

        case ACTION.WALK:
          let direction: DIRECTION = (_direction == DIRECTION.RIGHT ? 1 : -1);
          this.animatedNodeSprite.cmpTransform.local.rotation = ƒ.Vector3.Y(90 - 90 * direction);
          this.acceleration.x = (this.grounded ? Character.accelerationGround : Character.accelerationMidAir) * direction;
          break;

        case ACTION.JUMP:
          if (!this.jumpStart) {
            this.act(ACTION.JUMPSQUAT);
          } else {
            this.speed.y = 4;
            this.animatedNodeSprite.play(_action);
          }
          return;

        case ACTION.JUMPSQUAT:
          // the jump will be started after this animation finished, see event listener "animationFinished"
          break;

        case ACTION.JUMPSTART:
          this.jumpStart = true;
          ƒ.Time.game.setTimer(250, 1, () => {
            this.jumpStart = false;
          });
          this.act(ACTION.JUMP);
          return;
      }

      switch (this.animatedNodeSprite.action) {
        // these animations can not be interrupted
        case ACTION.JUMP:
        case ACTION.JUMPSQUAT:
          break;
        // all other animations can be interrrupted
        default:
          if (this.grounded)
            this.animatedNodeSprite.play(_action);
          else this.animatedNodeSprite.play(ACTION.FALL);
          break;
      }
    }

    protected update = (_event: ƒ.Eventƒ): void => {
      let timeFrame: number = ƒ.Loop.timeFrameGame / 1000; // seconds
      // console.log("acc: " + this.acceleration.x);

      this.speed = ƒ.Vector3.SUM(this.speed, ƒ.Vector3.SCALE(this.acceleration, timeFrame));
      this.speed.x = this.absMinSigned(this.speed.x, Character.speedMax.x);
      this.speed.y = this.absMinSigned(this.speed.y, Character.speedMax.y);
      // console.log("speed: " + this.speed.x);

      this.posLast = this.cmpTransform.local.translation;
      let distance: ƒ.Vector3 = ƒ.Vector3.SCALE(this.speed, timeFrame);

      distance.x = this.absMinSigned(distance.x, Character.distanceMax.x);
      distance.y = this.absMinSigned(distance.y, Character.distanceMax.y);

      this.cmpTransform.local.translate(distance);
      this.grounded = false;
      this.checkCollision();
    }

    private absMinSigned(x: number, y: number): number {
      return Math.sign(x) * Math.min(Math.abs(x), Math.abs(y));
    }

    private checkCollision(): void {
      // narrowing down possible collisions
      let position: ƒ.Vector3 = this.mtxWorld.translation;
      position = position.map((_value: number) => { return Math.floor(_value); });

      let possibleCollisions: ƒ.Rectangle[] = [];
      for (let x: number = -1; x <= 1; x++) {
        for (let y: number = -1; y <= 1; y++) {
          possibleCollisions = 
            possibleCollisions
              .concat(Block.hit[new ƒ.Vector3(position.x + x, position.y + y, 0).toString()])
              .filter((_value: ƒ.Rectangle) => _value != null);
        }
      }

      // checking possible collisions
      for (let rect of possibleCollisions) {
        ƒ.RenderManager.update();
        let tileHitBox: ƒ.Rectangle = rect;
        let playerHitBox: ƒ.Rectangle = this.hitBoxVertical.getRectWorld();
        let translation: ƒ.Vector3 = this.cmpTransform.local.translation;

        if (playerHitBox.collides(tileHitBox)) {
          // console.log("ver");
          this.resolveCollisionVertical(translation, playerHitBox, tileHitBox);
        } else {
          playerHitBox = this.hitBoxHorizontal.getRectWorld();
          if (playerHitBox.collides(tileHitBox)) {
            // console.log("hor");
            this.resolveCollisionHorizontal(translation, playerHitBox, tileHitBox);
          }
        }
        this.cmpTransform.local.translation = translation;
      }
      // for (let tile of staticObjects.getChildren()) {
      //   for (let block of tile.getChildren()) {
      //     ƒ.RenderManager.update();
      //     let tileHitBox: ƒ.Rectangle = (<Block>block).hitBox.getRectWorld();
      //     let playerHitBox: ƒ.Rectangle = this.hitBoxVertical.getRectWorld();
      //     let translation: ƒ.Vector3 = this.cmpTransform.local.translation;

      //     if (playerHitBox.collides(tileHitBox)) {
      //       // console.log("ver");
      //       this.resolveCollisionVertical(translation, playerHitBox, tileHitBox);
      //     } else {
      //       playerHitBox = this.hitBoxHorizontal.getRectWorld();
      //       if (playerHitBox.collides(tileHitBox)) {
      //         // console.log("hor");
      //         this.resolveCollisionHorizontal(translation, playerHitBox, tileHitBox);
      //       }
      //     }
      //     this.cmpTransform.local.translation = translation;
      //   }
      // }
    }

    private resolveCollisionVertical(_translation: ƒ.Vector3, _hitBox: ƒ.Rectangle, _tile: ƒ.Rectangle): void {
      if (this.posLast.y >= _tile.top) {
        _translation.y = _tile.bottom;
        this.grounded = true;
      } else {
        _translation.y = _tile.bottom - _hitBox.height;
        this.animatedNodeSprite.play(ACTION.FALL);
      }
      this.speed.y = 0;
    }

    private resolveCollisionHorizontal(_translation: ƒ.Vector3, _hitBox: ƒ.Rectangle, _tile: ƒ.Rectangle): void {
      if (this.posLast.x <= _tile.left) {
        _translation.x = _tile.left - _hitBox.width / 2;
      } else {
        _translation.x = _tile.right + _hitBox.width / 2;
      }
      this.speed.x = 0;
    }
  }
}