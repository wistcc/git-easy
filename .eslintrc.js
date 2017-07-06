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
        "indent": [2, 4],
        "space-before-function-paren": [
            "error",
            "never"
        ],
        'import/no-unresolved': 0
    }
};