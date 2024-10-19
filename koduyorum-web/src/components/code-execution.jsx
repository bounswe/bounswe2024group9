import React from "react";
import PropTypes from "prop-types";
import { Separator } from "./ui/seperator";
import { LightAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { Button } from "./ui/button";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

const InputBlock = ({ inputType ,number, explanation, code }) => (
  <div className="bg-gray-800 p-4 rounded-lg">
    <h3 className="font-semibold mb-2 text-gray-200">{inputType} {number}</h3>
    <p className="mb-4 text-gray-300">{explanation}</p>
    {code && (
      <SyntaxHighlighter language="javascript" style={docco}>
        {code}
      </SyntaxHighlighter>
    )}
  </div>
);

InputBlock.propTypes = {
  inputType: PropTypes.string.isRequired,
  number: PropTypes.number,
  explanation: PropTypes.string.isRequired,
  code: PropTypes.string,
};


export default function CodeExecution() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-2xl font-bold mb-4 text-gray-100">
          Second Greatest and Second Lowest Number  
        </h1>

        <div className="space-y-6">
          <InputBlock
            inputType="Question"
            explanation="Hi, I am trying to compute the second smallest and second largest numbers from an array of numbers. I have written the following code, but it is not working as expected. Can you help me fix it?"
            code={
`function Second_Greatest_Lowest(arr_num) {
  // Sort the array in ascending order using a custom comparison function
  arr_num.sort(function(x, y) {
    return x + y;
  });

  var uniqa = [arr_num[0]];
  var result = [];

  for (var j = 1; j < arr_num.length; j++) {
    if (arr_num[j - 1] !== arr_num[j]) {
      uniqa.push(arr_num[j]);
    }
  }
  result.push(uniqa[1], uniqa[uniqa.length - 2]);
  return result.join(',');
}
console.log(Second_Greatest_Lowest([1, 2, 3, 4, 5])); `}
          />
        </div>
        <Separator className="my-8 bg-gray-700" />

        <div className="space-y-6">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">
              Add Answer
          </Button>

          <InputBlock
            inputType="Answer"
            number={1}
            explanation="Puhahahahaha spaghetti code"
          />

          <InputBlock
            inputType="Answer"
            number={2}
            explanation="You are adding the numbers instead of comparing them. You should change the comparison function to return x - y instead of x + y."
            code={`
 arr_num.sort(function(x, y) {
    return x - y;
});
              `}
          />
        </div>
      </div>
    </div>
  );
}
