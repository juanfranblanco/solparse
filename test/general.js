"use strict";
const assert = require("chai").assert;
let SolidityParser = require("../index.js");

describe("Parser", function() {
    it("parses documentation examples without throwing an error", function() {
        SolidityParser.parseFile("./test/doc_examples.sol", true);
    });

    it("parses documentation examples using imports parser without throwing an error", function() {
        SolidityParser.parseFile("./test/doc_examples.sol", "imports", true);
    });
});

describe("Built Parser", function() {
    it("parses documentation examples without throwing an error", function() {
        SolidityParser.parseFile("./test/doc_examples.sol", false);
    });

    it("parses documentation examples using imports parser without throwing an error", function() {
        SolidityParser.parseFile("./test/doc_examples.sol", "imports", false);
    });
});


describe("Should parse constructor, receive and fallback", function() {
    it("parses contracts with constructor, receive and fallback", function() {
       let all =  SolidityParser.parseFile("./test/doc_examples.sol", false);
       let body = all.body;
       for (let i = 0; i < body.length; i++) {
            if(body[i].type === "ContractStatement" && body[i].name ==="receive_fallback_constructor") {
                    assert.isTrue(body[i].body[1].type === "ConstructorDeclaration");
                    assert.isTrue(body[i].body[2].type === "ReceiveDeclaration");
                    assert.isTrue(body[i].body[3].type === "FallbackDeclaration");
            }
        }
    });
});

describe("Should parse abstract", function() {
    it("parses contracts with abstract", function() {
       let all =  SolidityParser.parseFile("./test/doc_examples.sol", false);
       let body = all.body;
       for (let i = 0; i < body.length; i++) {
           if(body[i].type === "ContractStatement" && body[i].name ==="testAbstract") {
               assert.isTrue(body[i].is_abstract);
           }

           if(body[i].type === "ContractStatement" && body[i].name !=="testAbstract") {
               assert.isFalse(body[i].is_abstract);
           }
       }
    });
});

describe("Parse comments", () => {
    function isAValidCommentToken(c, sc) {
        return (
            ["Line", "Block"].includes(c.type) && typeof c.text === "string" &&
            (c.text.startsWith("//") || c.text.startsWith("/*")) && Number.isInteger(c.start) &&
            Number.isInteger(c.end) && sc.slice(c.start, c.end) === c.text
        );
    }

    it("should parse comments", () => {
        const sourceCode = require("fs").readFileSync("./test/doc_examples.sol", "utf8");
        const comments = SolidityParser.parseComments(sourceCode);

        const expectedCommLen = 60;

        if (comments.length !== expectedCommLen) {
            throw new Error(`there should be ${expectedCommLen} comment objects`);
        }

        comments.forEach(com => {
            if (!isAValidCommentToken(com, sourceCode)) {
                throw new Error(`${com} is not a valid comment token.`);
            }
        });
    });
});
