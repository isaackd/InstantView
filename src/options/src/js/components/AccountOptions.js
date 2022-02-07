import { h } from "preact";

import OptionsGroup from "./OptionsGroup.js";

function SignInButton(props) {
    return (
        <button id="sign-in" onClick={props.handleSignInClick}>
            <img src="icons/g-logo.png" width="20" />
            Sign in with Google
        </button>
    )
}

const AccountOptions = (props) => {

    return (
        <OptionsGroup title="Account" class="account" icon="icons/user.svg">
            <p id="sign-in-status">{props.signedIn ? "Account connected" : "No account connected"}</p>
            { !props.signedIn ? <SignInButton handleSignInClick={props.handleSignInClick} /> : null }
        </OptionsGroup>
    );
}

export default AccountOptions;
