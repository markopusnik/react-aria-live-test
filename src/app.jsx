'use strict';
require('./app.scss');

import React from 'react';
import ReactDOM from 'react-dom';
import { LiveAnnouncer, LiveMessage } from 'react-aria-live';

export default function createCounter() {
    const _counter = {};

    return function(id) {
        if (!id) {
            return null;
        }
        return _counter[id] ? _counter[id] += 1 : _counter[id] = 1;
    };
}

const counter = createCounter();

const m = (message, disable) => disable ? message : `${message} #${counter(message)}`;

const i = (type) => `${type}-${counter(type)}`;

class LiveMessageProxy extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            message: m(props.type),
            enabled: true,
            timer: props.timer,
            formId: i('form'),
            switchId: i('switch'),
            timerId: i('timer')
        };
        if (props.timer) this.intervalId = setInterval(this.buttonHandler, props.timer * 1000);
        this.buttonHandler = this.buttonHandler.bind(this);
        this.switchHandler = this.switchHandler.bind(this);
        this.timerHandler = this.timerHandler.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.type !== this.props.type
            || nextState.message !== this.state.message
            || nextState.enabled !== this.state.enabled
            || nextState.timer !== this.state.timer;
    }

    componentWillUpdate(nextProps, nextState) {
        if (nextState.timer !== this.state.timer) {
            if (this.intervalId) clearInterval(this.intervalId);
            if (nextState.timer) this.intervalId = setInterval(this.buttonHandler, nextState.timer * 1000);
        }
    }

    componentWillUnmount() {
        if (this.intervalId) clearInterval(this.intervalId);
    }

    buttonHandler() {
        if (this.state.enabled) {
            this.setState({ message: m(this.props.type) });
        }
    }

    switchHandler(e) {
        this.setState({ enabled: e.target.checked });
    };


    timerHandler(e, value) {
        this.setState({ timer: e.target.value });
    }

    render() {
        const { type } = this.props,
            { enabled, message, timer, formId, switchId, timerId } = this.state;
        return (
            <div className={'component component-proxy'}>
                {this.state.enabled &&
                <LiveMessage
                    message={message}
                    aria-live={type}
                />}
                <form aria-labelledby={formId}>
                    <legend id={formId}>LiveMessageProxy</legend>
                    <label htmlFor={switchId}>Switch:</label>
                    <input
                        id={switchId}
                        type="checkbox"
                        defaultChecked
                        onChange={this.switchHandler}
                    />
                    <label htmlFor={timerId}>Timer:</label>
                    <input
                        id={timerId}
                        type="number" placeholder="1..20" step="1" min="1" max="20"
                        value={this.state.timer}
                        onChange={this.timerHandler}
                    />
                    <button
                        type="button"
                        disabled={!enabled}
                        onClick={this.buttonHandler}>
                        {`Click for "${type}" message`}
                    </button>
                </form>
                <div className={'message'}>{message}</div>
            </div>
        );
    }
}
LiveMessageProxy.defaultProps = {
    timer: false
};

const Polite = (props) => <LiveMessageProxy type={'polite'} {...props}/>;
const Assertive = (props) => <LiveMessageProxy type={'assertive'} {...props}/>;


class MessageGenerator extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            message: m(props.message),
            timer: props.timer,
            formId: i('form'),
            timerId: i('timer')
        };
        if (props.timer) this.intervalId = setInterval(() => this.alterMessage(props.message), props.timer * 1000);
        this.buttonHandler = this.buttonHandler.bind(this);
        this.timerHandler = this.timerHandler.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.message !== this.props.message) {
            this.alterMessage(nextProps.message);
        }
        if (nextProps.timer !== this.props.timer) {
            this.setState({timer: nextProps.timer});
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.message !== this.state.message
        || nextState.timer !== this.state.timer;
    }

    componentWillUpdate(nextProps, nextState) {
        if (nextState.timer !== this.state.timer) {
            if (this.intervalId) clearInterval(this.intervalId);
            if (nextState.timer) this.intervalId = setInterval(() => this.alterMessage(nextProps.message), nextState.timer * 1000);
        }
    }

    componentWillUnmount() {
        if (this.intervalId) clearInterval(this.intervalId);
    }

    alterMessage(message) {
        this.setState({message: m(message)});
    }

    buttonHandler() {
        this.alterMessage(this.props.message)
    }

    timerHandler(e) {
        this.setState({ timer: e.target.value });
    }

    render() {
        const { children } = this.props,
            { message, timer, formId, timerId } = this.state;

        return (
            <div className={'component component-message'}>
                <form aria-labelledby={formId}>
                    <legend id={formId}>MessageGenerator</legend>
                    <label htmlFor={timerId}>Timer:</label>
                    <input
                        id={timerId}
                        type="number" placeholder="1..20" step="1" min="1" max="20"
                        value={this.state.timer}
                        onChange={this.timerHandler}
                    />
                    <button
                        type="button"
                        onClick={this.buttonHandler}>
                        {`Click for "${this.props.message}" message`}
                    </button>
                </form>
                <div className={'message'}>{message}</div>
                {React.Children.map(children, function(child) {return React.cloneElement(child, {message});}, this)}
            </div>
        );
    }
}
MessageGenerator.defaultProps = {
  timer: false
};


class LiveRegion extends React.Component {
    constructor(props) {
        super(props);
        const { prefix, type, disabled, role, ariaLive, ariaAtomic, ariaRelevant, ariaBusyDisabled } = props,
            message = `${prefix} ${props.message}`;
        this.state = {
            message,
            message1: message,
            message2: '',
            messageArray: [<div key={message}>{message}</div>],
            type,
            enabled: !disabled,
            role,
            ariaLive,
            ariaAtomic,
            ariaRelevant,
            ariaBusyEnabled: !ariaBusyDisabled,
            formId: i('form'),
            switchId: i('switch'),
            typeId: i('timer'),
            roleId: i('timer'),
            ariaLiveId: i('timer'),
            ariaAtomicId: i('timer'),
            ariaRelevantId: i('timer'),
            busyId: i('busy')
        };
        this.switchHandler = this.switchHandler.bind(this);
        this.typeHandler = this.typeHandler.bind(this);
        this.roleHandler = this.roleHandler.bind(this);
        this.ariaLiveHandler = this.ariaLiveHandler.bind(this);
        this.ariaAtomicHandler = this.ariaAtomicHandler.bind(this);
        this.ariaRelevantHandler = this.ariaRelevantHandler.bind(this);
        this.ariaBusyHandler = this.ariaBusyHandler.bind(this);
    }

    componentDidMount() {
        if (this.state.ariaBusyEnabled) this.setState({ariaBusy: false});
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.message !== this.props.message || nextProps.prefix !== this.props.prefix) {
            const { prefix, children } = nextProps,
                message = `${prefix} ${nextProps.message}`;
            this.state.messageArray.push(<div key={message}>{message}</div>);
            this.state.messageArray.splice(0, this.state.messageArray.length - 2);
            this.setState({
                message: message,
                message1: this.state.message1 ? '' : message,
                message2: this.state.message1 ? message : '',
                ariaBusy: this.state.ariaBusyEnabled
            });
        }
        if (nextProps.type !== this.props.type) {
            this.setState({type: nextProps.type})
        }
        if (nextProps.disabled !== this.props.disabled) {
            this.setState({enabled: !nextProps.disabled})
        }

    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.message !== this.state.message
            || nextState.type !== this.state.type
            || nextState.enabled !== this.state.enabled
            || nextState.role !== this.state.role
            || nextState.ariaLive !== this.state.ariaLive
            || nextState.ariaAtomic !== this.state.ariaAtomic
            || nextState.ariaRelevant !== this.state.ariaRelevant
            || nextState.ariaBusyEnabled !== this.state.ariaBusyEnabled
            || nextState.ariaBusy !== this.state.ariaBusy;
    }

    componentDidUpdate() {
        if (this.state.ariaBusyEnabled) this.setState({ariaBusy: false});
    }

    switchHandler(e) {
        this.setState({ enabled: e.target.checked });
    };

    typeHandler(e) {
        this.setState({ type: e.target.value });
    }

    roleHandler(e) {
        this.setState({ role: e.target.value });
    }

    ariaLiveHandler(e) {
        this.setState({ ariaLive: e.target.value });
    }

    ariaAtomicHandler(e) {
        this.setState({ ariaAtomic: e.target.value });
    }

    ariaRelevantHandler(e) {
        this.setState({ ariaRelevant: e.target.value });
    }

    ariaBusyHandler(e) {
        this.setState({ ariaBusyEnabled: e.target.checked });
    };

    render() {
        const { message, message1, message2, messageArray, enabled, type,
            role, ariaLive, ariaAtomic, ariaRelevant, ariaBusyEnabled, ariaBusy,
            formId, switchId, typeId, roleId, ariaLiveId, ariaAtomicId, ariaRelevantId, busyId} = this.state;


        const ariaProps = { };
        if (ariaBusyEnabled) ariaProps['aria-busy'] = ariaBusy;
        if (role !== '[disabled]') ariaProps.role = role;
        if (ariaLive !== '[disabled]') ariaProps['aria-live'] = ariaLive;
        if (ariaAtomic !== '[disabled]') ariaProps['aria-atomic'] = ariaAtomic;
        if (ariaRelevant !== '[disabled]') ariaProps['aria-relevant'] = ariaRelevant;

        return (
            <div className={'component component-live'}>
                {enabled && type === 'duplicated' &&
                <OffDiv>
                    <div {...ariaProps}>
                        {message1}
                    </div>
                    <div {...ariaProps}>
                        {message2}
                    </div>
                </OffDiv>}
                {enabled && type === 'single' &&
                <OffDiv {...ariaProps}>
                    {message}
                </OffDiv>}
                {enabled && type === 'div' &&
                <OffDiv {...ariaProps}>
                    <div key="message">{message}</div>
                </OffDiv>}
                {enabled && type === 'keyed-div' &&
                <OffDiv {...ariaProps}>
                    <div key={message}>{message}</div>
                </OffDiv>}
                {enabled && type === 'array' &&
                <OffDiv {...ariaProps}>
                    {messageArray}
                </OffDiv>}
                {enabled && type === 'html' &&
                <OffDiv {...ariaProps} dangerouslySetInnerHTML={{__html: message}} />}
                <form aria-labelledby={formId}>
                    <legend id={formId}>LiveRegion</legend>
                    <label htmlFor={switchId}>Switch:</label>
                    <input
                        id={switchId}
                        type="checkbox"
                        checked={enabled}
                        onChange={this.switchHandler}
                    />
                    <label htmlFor={typeId}>Type:</label>
                    <select onChange={this.typeHandler} value={type} id={typeId}>
                        <option>single</option>
                        <option>duplicated</option>
                        <option>div</option>
                        <option>keyed-div</option>
                        <option>array</option>
                        <option>html</option>
                    </select>
                    <label htmlFor={roleId}>role:</label>
                    <select onChange={this.roleHandler} value={role} id={roleId}>
                        <option>status</option>
                        <option>alert</option>
                        <option>log</option>
                        <option>marquee</option>
                        <option>timer</option>
                        <option>[disabled]</option>
                    </select>
                    <label htmlFor={ariaLiveId}>aria-live:</label>
                    <select onChange={this.ariaLiveHandler} value={ariaLive} id={ariaLiveId}>
                        <option>assertive</option>
                        <option>polite</option>
                        <option>off</option>
                        <option>[disabled]</option>
                    </select>
                    <label htmlFor={ariaAtomicId}>aria-atomic:</label>
                    <select onChange={this.ariaAtomicHandler} value={ariaAtomic} id={ariaAtomicId}>
                        <option>true</option>
                        <option>false</option>
                        <option>[disabled]</option>
                    </select>
                    <label htmlFor={ariaRelevantId}>aria-relevent:</label>
                    <select onChange={this.ariaRelevantHandler} value={ariaRelevant} id={ariaRelevantId}>
                        <option>additions text</option>
                        <option>removals text</option>
                        <option>additions removals</option>
                        <option>text</option>
                        <option>additions</option>
                        <option>removals</option>
                        <option>all</option>
                        <option>[disabled]</option>
                    </select>
                    <label htmlFor={busyId}>enable aria-busy:</label>
                    <input
                        id={busyId}
                        type="checkbox"
                        checked={ariaBusyEnabled}
                        onChange={this.ariaBusyHandler}
                    />
                    <div className={'message'}>
                        {message}
                    </div>
                </form>
            </div>
        )
    }
}
LiveRegion.defaultProps = {
    type: 'duplicated',
    prefix: '',
    role: 'log',
    ariaLive: 'polite',
    ariaAtomic: 'true',
    ariaRelevant: 'additions text',
    ariaBusyDisabled: true,
    disabled: false
};


const OffDiv = ({children, ...rest}) =>
    <div {...rest} className={'off'}>
        {children}
    </div>;


class MyApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            force: false
        };
        this.buttonHandler = this.buttonHandler.bind(this);
    }

    buttonHandler() {
        this.setState({force: Math.random()});
    }

    render() {
        const mk = m('keyed'),
            mf = m('forced');

        return (
            <main aria-labelledby={'main'}>
                <h1 id="main">Aria live region with react.js</h1>
                <LiveAnnouncer>
                    <button
                        type="button"
                        onClick={this.buttonHandler}>
                        {`Force render!`}
                    </button>
                    <section aria-labelledby="react-aria-live">
                        <h2 id="react-aria-live">"react-aria-live"</h2>
                        <Polite />
                        <Assertive />
                    </section>
                    <section aria-labelledby="custom">
                        <h2 id="custom">Custom components</h2>
                        <MessageGenerator message="outer">
                            <LiveRegion />
                        </MessageGenerator>
                        <div className={'component component-group'}>
                            <MessageGenerator message="inner">
                                <LiveRegion />
                            </MessageGenerator>
                            <LiveRegion message={mf} />
                            <LiveRegion key={mk} message={mk} />
                        </div>
                        <MessageGenerator message="preset">
                            <LiveRegion prefix={'assertive'} ariaLive={'assertive'} />
                            <LiveRegion prefix={'polite'} ariaLive={'polite'}/>
                            <LiveRegion prefix={'off'} ariaLive={'off'} />
                        </MessageGenerator>
                    </section>
                </LiveAnnouncer>
            </main>
        );
    }
}


ReactDOM.render(<MyApp />, document.getElementById('container'));
