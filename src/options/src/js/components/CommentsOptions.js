import { h } from "preact";

import OptionsGroup from "./OptionsGroup.js";

const CommentsOptions = (props) => {
    return (
        <OptionsGroup title="Comments" class="comments-opt" icon="icons/comments.svg">
            <div id="comment-borders-wrapper" class="option-wrapper">
                <div class="input-wrapper">
                    <input 
                        id="comment-borders" 
                        type="checkbox" 
                        onChange={(e) => props.toggleOption("commentBorders")}
                        checked={props.commentBorders} />
                    <label for="comment-borders" class="option-label">Add a border around each comment</label>
                </div>
            </div>
            <div id="comment-padding-wrapper" class="option-wrapper">
                <div class="input-wrapper">
                    <input 
                        id="comment-padding" 
                        type="checkbox" 
                        onChange={(e) => props.toggleOption("commentSpacing")}
                        checked={props.commentSpacing} />
                    <label for="comment-padding" class="option-label">Increased spacing between comments</label>
                </div>
            </div>
            <div id="comment-separation-wrapper" class="option-wrapper">
                <div class="input-wrapper">
                    <input 
                        id="comment-separation" 
                        type="checkbox" 
                        onChange={(e) => props.toggleOption("commentSeparation")}
                        checked={props.commentSeparation} />
                    <label for="comment-separation" class="option-label">Separate video and comment panels</label>
                </div>
            </div>
        </OptionsGroup>
    );
}

export default CommentsOptions;