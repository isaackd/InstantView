import { h, Component } from "preact";

import "./OptionsGroup.css";

export default class OptionsGroup extends Component {

    render(props) {
        return (
            <options-group {...{class: props.class ? props.class : null}}>
                <div class="options-group-header">
                    <div class="header-left">
                        <img src={props.icon} />
                        <span class="options-group-name">{props.title}</span>
                    </div>
                </div>
                <div class="options-group-content">
                    {props.children}
                </div>
            </options-group>
        );
    }

}
