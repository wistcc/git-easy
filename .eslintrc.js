module.exports = {
    "extends": "airbnb-base",
    "globals": {
        "document": true,
        "fetch": true
    },
    "rules": {
        "comma-dangle": ["error", {
            "functions": "never",
        }],
        "space-before-function-paren": [
            "error",
            "never"
        ],
        'import/no-unresolved': 0,
        'import/no-extraneous-dependencies': 0
    }
};
