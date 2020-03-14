import React, { Component } from "react";
import PropTypes from "prop-types";
import { loadAnimation } from "lottie-web";

import { getSize } from "./utils";

export default class Lottie extends Component {
  static propTypes = {
    options: PropTypes.object.isRequired,
    eventListeners: PropTypes.arrayOf(PropTypes.object),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    renderAs: PropTypes.oneOf(["div", "span"]),
    isStopped: PropTypes.bool,
    isPaused: PropTypes.bool,
    speed: PropTypes.number,
    segments: PropTypes.arrayOf(PropTypes.number),
    forceSegments: PropTypes.bool,
    direction: PropTypes.number,
    ariaRole: PropTypes.string,
    ariaLabel: PropTypes.string,
    isClickToPauseDisabled: PropTypes.bool,
    title: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string,
    tabIndex: PropTypes.number
  };

  static defaultProps = {
    renderAs: "div",
    eventListeners: [],
    isStopped: false,
    isPaused: false,
    speed: 1,
    ariaRole: "button",
    ariaLabel: "animation",
    isClickToPauseDisabled: false,
    title: "",
    className: "",
    tabIndex: 0
  };

  componentDidMount() {
    const { options, eventListeners } = this.props;
    const {
      loop,
      autoplay,
      animationData,
      rendererSettings,
      segments,
      forceSegments
    } = options;

    this.options = {
      container: this.el,
      renderer: "svg",
      loop: loop !== false,
      autoplay: autoplay !== false,
      segments: segments !== false,
      forceSegments,
      animationData,
      rendererSettings
    };

    this.options = { ...this.options, ...options };

    this.anim = loadAnimation(this.options);
    this.registerEvents(eventListeners);
  }

  componentDidUpdate(nextProps) {
    /* Recreate the animation handle if the data is changed */
    const { eventListeners, isStopped, segments } = this.props;
    if (this.options.animationData !== nextProps.options.animationData) {
      this.deRegisterEvents(eventListeners);
      this.destroy();
      this.options = { ...this.options, ...nextProps.options };
      this.anim = loadAnimation(this.options);
      this.registerEvents(nextProps.eventListeners);
    }

    if (isStopped) {
      this.stop();
    } else if (segments) {
      this.playSegments();
    } else {
      this.play();
    }

    this.pause();
    this.setSpeed();
    this.setDirection();
  }

  componentWillUnmount() {
    this.deRegisterEvents(this.props.eventListeners);
    this.destroy();
    this.options.animationData = null;
    this.anim = null;
  }

  setSpeed() {
    this.anim.setSpeed(this.props.speed);
  }

  setDirection() {
    this.anim.setDirection(this.props.direction);
  }

  play() {
    this.anim.play();
  }

  playSegments() {
    this.anim.playSegments(this.props.segments);
  }

  stop() {
    this.anim.stop();
  }

  pause() {
    if (this.props.isPaused && !this.anim.isPaused) {
      this.anim.pause();
    } else if (!this.props.isPaused && this.anim.isPaused) {
      this.anim.pause();
    }
  }

  destroy() {
    this.anim.destroy();
  }

  registerEvents(eventListeners) {
    eventListeners.forEach(({ eventName, callback }) => {
      this.anim.addEventListener(eventName, callback);
    });
  }

  deRegisterEvents(eventListeners) {
    eventListeners.forEach(({ eventName, callback }) => {
      this.anim.removeEventListener(eventName, callback);
    });
  }

  handleClickToPause = () => {
    // The pause() method is for handling pausing by passing a prop isPaused
    // This method is for handling the ability to pause by clicking on the animation
    if (this.anim.isPaused) {
      this.anim.play();
    } else {
      this.anim.pause();
    }
  };

  render() {
    const {
      renderAs,
      width,
      height,
      ariaRole,
      ariaLabel,
      isClickToPauseDisabled,
      title,
      style,
      className,
      tabIndex
    } = this.props;

    const lottieStyles = {
      width: getSize(width),
      height: getSize(height),
      outline: "none",
      ...style
    };

    const onClickHandler = isClickToPauseDisabled
      ? () => null
      : this.handleClickToPause;
    const Element = renderAs;
    return (
      // Bug with eslint rules https://github.com/airbnb/javascript/issues/1374
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <Element
        ref={c => {
          this.el = c;
        }}
        className={className}
        style={lottieStyles}
        onClick={onClickHandler}
        title={title}
        role={ariaRole}
        aria-label={ariaLabel}
        tabIndex={tabIndex}
      />
    );
  }
}
