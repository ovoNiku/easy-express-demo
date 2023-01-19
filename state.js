abstract class State {
  constructor(protected sm: StateMachine){}
  public abstract enter(): void;
  public abstract onUpdate(): void;
  public abstract leave(): void;
}

class BaseState extends State {
  public enter() {

  }
  public onUpdate() {

  }
  public leave() {

  }
}

class State1 extends BaseState {
  public enter() {
    document.querySelector(".start")?.addEventListener("click", this.handleClick);
  }
  public leave() {
    document.querySelector(".start")?.removeEventListener("click", this.handleClick);
  }
  handleClick = () => {
    this.sm.switchTo((sm) => new State2(sm));
  }
}

class State2 extends BaseState {
  public enter() {
    document.querySelector(".exit")?.addEventListener("click", this.handleClick);
  }
  public leave() {
    document.querySelector(".exit")?.removeEventListener("click", this.handleClick);
  }
  handleClick = () => {
    this.sm.switchTo((sm) => new State1(sm));
  }
}

class StateMachine {
  state: State
  constructor(stateFac: (sm: StateMachine) => State){
    this.state = stateFac(this);
    this.state.enter();
  }
  switchTo(stateFac: (sm: StateMachine) => State){
    this.state.leave();
    this.state = stateFac(this);
    this.state.enter();
  }
}
