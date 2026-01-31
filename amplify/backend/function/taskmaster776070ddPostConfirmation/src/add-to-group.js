const {
    CognitoIdentityProviderClient,
    AdminAddUserToGroupCommand,
    GetGroupCommand,
    CreateGroupCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

const cognito = new CognitoIdentityProviderClient({});

/**
 * @type {import('@types/aws-lambda').PostConfirmationTriggerHandler}
 */
exports.handler = async (event) => {
    const adminEmails = ["nick@nickhanson.me"];

    const email = event.request?.userAttributes?.email || "";
    const username = event.userName || "";

    // --- DENY: never assign Admin to demo identities ---
    // Covers cases where username is email OR email attribute is present.
    const isDemoIdentity =
        email.toLowerCase().startsWith("demo+") ||
        email.toLowerCase().endsWith("@taskmaster.me") ||
        username.toLowerCase().startsWith("demo+") ||
        username.toLowerCase().endsWith("@taskmaster.me");

    if (isDemoIdentity) {
        // Nothing to do; explicitly refuse Admin assignment.
        return event;
    }
    // ---------------------------------------------------

    const isAdmin = adminEmails.includes(email);

    if (!isAdmin) {
        return event; // nothing to do
    }

    const groupParams = {
        UserPoolId: event.userPoolId,
        GroupName: "Admin",
    };

    const userParams = {
        UserPoolId: event.userPoolId,
        Username: event.userName,
        GroupName: "Admin",
    };

    // Ensure group exists
    try {
        await cognito.send(new GetGroupCommand(groupParams));
    } catch (e) {
        await cognito.send(new CreateGroupCommand(groupParams));
    }

    // Add user to group
    await cognito.send(new AdminAddUserToGroupCommand(userParams));

    return event;
};
