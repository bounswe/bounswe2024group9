import React from "react"
import PropTypes from "prop-types"
import { Textarea } from "./ui/textarea"
import { Separator } from "./ui/seperator"

const AnswerBlock = ({ number, explanation, code }) => (
  <div className="bg-gray-800 p-4 rounded-lg">
    <h3 className="font-semibold mb-2 text-gray-200">Answer {number}</h3>
    <p className="mb-4 text-gray-300">{explanation}</p>
    <Textarea
      className="font-mono min-h-[150px] bg-gray-900 text-gray-100 border-gray-700"
      readOnly
      value={code}
    />
  </div>
)

AnswerBlock.propTypes = {
  number: PropTypes.number.isRequired,
  explanation: PropTypes.string.isRequired,
  code: PropTypes.string.isRequired,
}

export default function CodeExecution() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-2xl font-bold mb-4 text-gray-100">How do I center a div in CSS?</h1>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-200">Question</h2>
            <Textarea
              className="min-h-[100px] bg-gray-800 text-gray-100 border-gray-700"
              placeholder="Enter your question details here..."
              defaultValue="I'm trying to center a div both horizontally and vertically within its parent container. I've tried using margin: auto but it only centers horizontally. What's the best way to achieve this?"
            />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-200">Code</h2>
            <Textarea
              className="font-mono min-h-[150px] bg-gray-800 text-gray-100 border-gray-700"
              placeholder="Enter your code here..."
              defaultValue={`.parent {
  width: 100%;
  height: 100vh;
}

.child {
  width: 200px;
  height: 200px;
  background-color: #f0f0f0;
  margin: auto;
}`}
            />
          </div>
          
        </div>
        
        <Separator className="my-8 bg-gray-700" />
        
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-200">Answers</h2>
          
          <AnswerBlock
            number={1}
            explanation="To center a div both horizontally and vertically, you can use Flexbox. It's a modern and efficient way to handle centering in CSS. Here's how you can modify your CSS:"
            code={`.parent {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
}

.child {
  width: 200px;
  height: 200px;
  background-color: #f0f0f0;
}`}
          />
          
          <AnswerBlock
            number={2}
            explanation="Another modern approach is to use CSS Grid. This method is particularly useful if you have multiple elements to center or need more complex layouts:"
            code={`.parent {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100vh;
}

.child {
  width: 200px;
  height: 200px;
  background-color: #f0f0f0;
}`}
          />
        </div>
      </div>
    </div>
  )
}