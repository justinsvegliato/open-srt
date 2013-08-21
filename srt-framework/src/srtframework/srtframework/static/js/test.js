$(document).ready(function() {
    Phase = {
        INSTRUCTION: 0,
        TESTING: 1,
        TERMINATION: 2,
    };

    var phase = Phase.INSTRUCTION;
    var block = handleBlock();
    $("#instructions").html(block.fields.instructions);
    var anchorCount = 0;

    $(document).keypress(function(event) {
        if (phase != phase.TERMINATION) {
            var keyPressed = (event.keyCode ? event.keyCode : event.which);
            var START_KEY_BIND = 32;
            var RIGHT_KEY_BIND = test[0].fields.right_key_bind.charCodeAt(0);
            var LEFT_KEY_BIND = test[0].fields.left_key_bind.charCodeAt(0);
            if (keyPressed == START_KEY_BIND && phase == Phase.INSTRUCTION) {
                phase = Phase.TESTING;
                $("#instruction-phase-container").hide();
                $("#testing-phase-container").show();
                leftLabel = handleLeftLabel(block);
                rightLabel = handleRightLabel(block);
                anchor = handleAnchor(rightLabel, leftLabel);
                startTime = new Date().getTime();
                correct = true;
            } else if ((keyPressed == RIGHT_KEY_BIND || keyPressed == LEFT_KEY_BIND) && phase == Phase.TESTING) {
                if (anchorCount < block.fields.length) {
                    var anchorLabelId = anchor.fields.label;
                    if ((keyPressed == RIGHT_KEY_BIND && anchorLabelId == rightLabel.pk) || (keyPressed == LEFT_KEY_BIND && anchorLabelId == leftLabel.pk)) {
                        recordTrial(leftLabel, rightLabel, anchor, new Date().getTime() - startTime, correct)
                        startTime = new Date().getTime();
                        anchor = handleAnchor(leftLabel, rightLabel);
                        $("#status").css("visibility", "hidden");
                        anchorCount++;
                        correct = true;
                    } else {
                        correct = false;
                        $("#status").css("visibility", "visible");
                    }
                } else if (blocks.length > 0) {
                    phase = Phase.INSTRUCTION;
                    block = handleBlock();
                    $("#instructions").html(block.fields.instructions);
                    $("#testing-phase-container").hide();
                    $("#instruction-phase-container").show();
                    anchorCount = 0;
                    blockLength = 0;
                } else {
                    $("#testing-phase-container").hide();
                    $("#termination-phase-container").show();
                    phase = Phase.TERMINATION;
                }
            }
        }
    });
});

function handleBlock() {
    for (var rank = 1; rank < 10; rank++) {
        var blockGroup = $.grep(blocks, function(n, i) {
            return n.fields.rank == rank;
        });
        if (blockGroup != null && blockGroup.length != 0) {
            var block = blockGroup[Math.floor(Math.random() * blockGroup.length)];
            blocks = blocks.filter(function(item) {
                return item.pk !== block.pk;
            });
            return block;
        }
    }
}

function handleAnchor(rightLabel, leftLabel) {
    var filteredAnchors = $.grep(anchors, function(n, i) {
        return n.fields.label == rightLabel.pk || n.fields.label == leftLabel.pk;
    });
    var anchor = anchors[Math.floor(Math.random() * anchors.length)];
    $("#anchor").html(anchor.fields.value);
    return anchor;
}

function handleLeftLabel(block) {
    var leftLabel = $.grep(labels, function(n, i) {
        return n.pk == block.fields.left_label;
    })[0];
    $("#left-label").html(leftLabel.fields.name).css("color", "#" + leftLabel.fields.color);
    return leftLabel;
}

function handleRightLabel(block) {
    var rightLabel = $.grep(labels, function(n, i) {
        return n.pk == block.fields.right_label;
    })[0];
    $("#right-label").html(rightLabel.fields.name).css("color", "#" + rightLabel.fields.color);
    return rightLabel;
}

function recordTrial(leftLabel, rightLabel, anchor, reactionTime, correct) {
    data = {
        "left_label": leftLabel.fields.name,
        "right_label": rightLabel.fields.name,
        "anchor": anchor.fields.value,
        "reaction_time": reactionTime,
        "correct": correct
    };
    $.get("../record/", data);
}