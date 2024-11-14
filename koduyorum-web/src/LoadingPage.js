import React, { useState, useEffect } from 'react';

const facts = [
  // Python Facts
  { "Python": "Python was named after Monty Python, not the snake." },
  { "Python": "Python was created by Guido van Rossum and first released in 1991." },
  { "Python": "Python emphasizes code readability with its use of significant indentation." },
  { "Python": "The Zen of Python is a collection of 19 guiding principles for writing computer programs." },
  { "Python": "Python supports multiple programming paradigms, including procedural, object-oriented, and functional programming." },
  { "Python": "Python is an open-source language with a large and active community." },
  { "Python": "The Python Package Index (PyPI) hosts thousands of third-party modules for Python." },
  { "Python": "Python is used extensively in data science, machine learning, and artificial intelligence." },
  { "Python": "Major organizations like Google, NASA, and Netflix use Python in their tech stacks." },
  { "Python": "Python's mascot is a friendly snake named 'Python'." },
  
  // JavaScript Facts
  { "JavaScript": "JavaScript was created in just 10 days by Brendan Eich in 1995." },
  { "JavaScript": "JavaScript was originally named Mocha, then renamed to LiveScript, and finally to JavaScript." },
  { "JavaScript": "Despite its name, JavaScript is not directly related to Java." },
  { "JavaScript": "JavaScript is the most popular programming language for web development." },
  { "JavaScript": "Node.js allows JavaScript to be used for server-side scripting." },
  { "JavaScript": "JSON (JavaScript Object Notation) is a widely used data interchange format derived from JavaScript." },
  { "JavaScript": "JavaScript supports event-driven, functional, and imperative programming styles." },
  { "JavaScript": "ECMAScript is the standardized specification of JavaScript." },
  { "JavaScript": "JavaScript engines like V8 and SpiderMonkey power modern web browsers." },
  { "JavaScript": "Popular frameworks like React, Angular, and Vue are built with JavaScript." },
  
  // Java Facts
  { "Java": "Java was developed by James Gosling at Sun Microsystems and released in 1995." },
  { "Java": "Java was initially called Oak after an oak tree outside Gosling's office." },
  { "Java": "Java is designed to be platform-independent with its 'write once, run anywhere' philosophy." },
  { "Java": "Java's mascot is named Duke, a whimsical character." },
  { "Java": "Java is one of the most popular programming languages for Android app development." },
  { "Java": "Java uses a Just-In-Time (JIT) compiler for improved performance." },
  { "Java": "The Java Virtual Machine (JVM) allows Java programs to run on any device or operating system." },
  { "Java": "Java is an object-oriented programming language with features like inheritance and polymorphism." },
  { "Java": "Java has a rich standard library known as the Java Class Library." },
  { "Java": "Major companies like Amazon, Google, and LinkedIn use Java extensively." },
  
  // C# Facts
  { "C#": "C# (pronounced 'C-Sharp') was developed by Microsoft and released in 2000." },
  { "C#": "C# was designed by Anders Hejlsberg, who also created Turbo Pascal and led the development of Delphi." },
  { "C#": "C# is a key language for Microsoft's .NET framework." },
  { "C#": "The name 'C#' is inspired by musical notation, where a sharp indicates a note is a semitone higher." },
  { "C#": "C# supports both object-oriented and component-oriented programming disciplines." },
  { "C#": "C# is used for developing Windows applications, web services, and games using Unity." },
  { "C#": "C# has language-integrated query (LINQ) capabilities for data manipulation." },
  { "C#": "C# has strong typing and automatic garbage collection." },
  { "C#": "Async and await keywords in C# simplify asynchronous programming." },
  { "C#": "C# 8.0 introduced nullable reference types to help avoid null reference exceptions." },
  
  // C++ Facts
  { "C++": "C++ was developed by Bjarne Stroustrup as an extension of the C language." },
  { "C++": "C++ supports both procedural and object-oriented programming paradigms." },
  { "C++": "C++ introduced concepts like classes, inheritance, and polymorphism to C." },
  { "C++": "C++ is known for its performance and is often used in system/software development." },
  { "C++": "C++ has been standardized by the ISO, with the latest version being C++20." },
  { "C++": "C++ allows for low-level memory manipulation using pointers." },
  { "C++": "The Standard Template Library (STL) in C++ provides a set of common classes and interfaces." },
  { "C++": "C++ is used in developing operating systems, game engines, and real-time simulations." },
  { "C++": "C++ supports operator overloading and function overloading." },
  { "C++": "Famous software like Adobe Photoshop and portions of the Windows OS are written in C++." },
  // C Facts
  { "C": "C was developed by Dennis Ritchie at Bell Labs in the early 1970s." },
  { "C": "C was originally created to develop the UNIX operating system." },
  { "C": "C is known as the mother of many modern programming languages." },
  { "C": "C influenced languages like C++, C#, Java, and many others." },
  { "C": "The C programming language was standardized in 1989 as ANSI C." },
  { "C": "C provides low-level access to memory through the use of pointers." },
  { "C": "C is widely used in embedded systems and operating systems." },
  { "C": "The Linux kernel is primarily written in C." },
  { "C": "C allows for structured programming and lexical variable scope." },
  { "C": "Despite being over 40 years old, C remains one of the most widely used languages." },

  // MATLAB Facts
  { "MATLAB": "MATLAB stands for 'Matrix Laboratory'." },
  { "MATLAB": "MATLAB was developed by Cleve Moler in the late 1970s." },
  { "MATLAB": "MATLAB is widely used in engineering, science, and economics." },
  { "MATLAB": "MATLAB is known for its powerful numerical computing environment." },
  { "MATLAB": "MATLAB allows for easy matrix manipulations and data visualization." },
  { "MATLAB": "Simulink is an add-on product to MATLAB for modeling and simulating dynamic systems." },
  { "MATLAB": "MATLAB code can be compiled into standalone applications." },
  { "MATLAB": "MATLAB has a proprietary programming language that supports object-oriented programming." },
  { "MATLAB": "Many universities use MATLAB for teaching linear algebra and numerical analysis." },
  { "MATLAB": "Toolboxes in MATLAB provide specialized functions for various fields like signal processing and control systems." },

  // Ruby Facts
  { "Ruby": "Ruby was created by Yukihiro 'Matz' Matsumoto in Japan in the mid-1990s." },
  { "Ruby": "Ruby is designed for productivity and fun, with an elegant syntax." },
  { "Ruby": "Ruby is fully object-oriented; even primitive data types are objects." },
  { "Ruby": "Ruby on Rails is a popular web application framework written in Ruby." },
  { "Ruby": "Ruby is influenced by Perl, Smalltalk, Eiffel, Ada, and Lisp." },
  { "Ruby": "In Ruby, you can reopen and modify existing classes." },
  { "Ruby": "Ruby follows the principle of 'least astonishment,' aiming to minimize confusion for users." },
  { "Ruby": "Symbols in Ruby are immutable, reusable constants represented internally by an integer value." },
  { "Ruby": "RubyGems is the package manager for Ruby, hosting thousands of libraries." },
  { "Ruby": "GitHub was originally built using Ruby on Rails." },

  // Swift Facts
  { "Swift": "Swift is a programming language developed by Apple, first released in 2014." },
  { "Swift": "Swift is designed to be safe, fast, and expressive." },
  { "Swift": "Swift code is interactive and fun, with concise yet expressive syntax." },
  { "Swift": "Swift aims to be more resilient to erroneous code than Objective-C." },
  { "Swift": "Swift uses type inference and optionals to reduce errors." },
  { "Swift": "Swift supports playgrounds, which are interactive coding environments." },
  { "Swift": "Swift is open source and has a growing community outside of Apple platforms." },
  { "Swift": "Swift can interoperate with Objective-C codebases." },
  { "Swift": "Swift supports protocol-oriented programming, emphasizing the use of protocols." },
  { "Swift": "Swift Package Manager helps manage dependencies and distribute code." },

  // Go Facts
  { "Go": "Go, also known as Golang, was developed at Google in 2007." },
  { "Go": "Go was designed by Robert Griesemer, Rob Pike, and Ken Thompson." },
  { "Go": "Go is known for its simplicity, concurrency support, and performance." },
  { "Go": "Go compiles quickly to native machine code without the need for a virtual machine." },
  { "Go": "Go includes built-in support for concurrent programming using goroutines." },
  { "Go": "The Go language mascot is a gopher." },
  { "Go": "Go's syntax is similar to C but includes memory safety and garbage collection." },
  { "Go": "Go has a strong standard library and built-in tools like gofmt for formatting code." },
  { "Go": "Go is often used for cloud services, networking tools, and distributed systems." },
  { "Go": "Docker and Kubernetes, popular containerization technologies, are written in Go." },  

  // Random Facts
  { "Python": "Python was named after Monty Python, not the snake." },
  { "Java": "Java was initially called Oak." },
  { "C": "C is known as the mother of all programming languages." },
  { "JavaScript": "JavaScript was created in just 10 days." },
  { "Ruby": "Ruby was influenced by Perl, Smalltalk, and Lisp." },
  { "Go": "Go was developed at Google in 2007." },
  { "Swift": "Swift was introduced by Apple in 2014 as a replacement for Objective-C." },
  { "PHP": "PHP originally stood for 'Personal Home Page'." },
  { "Perl": "Perl is sometimes called the 'Swiss Army chainsaw' of scripting languages." },
  { "Fortran": "Fortran is one of the oldest programming languages, dating back to 1957." },
  { "COBOL": "COBOL stands for 'Common Business-Oriented Language'." },
  { "Lisp": "Lisp was created in 1958 and is known for its parentheses." },
  { "Haskell": "Haskell is a purely functional programming language named after mathematician Haskell Curry." },
  { "C++": "C++ was originally called 'C with Classes'." },
  { "Kotlin": "Kotlin is fully interoperable with Java and runs on the JVM." },
  { "R": "R is widely used among statisticians and data miners for data analysis." },
  { "Rust": "Rust focuses on safety and concurrency, preventing segmentation faults." },
  { "TypeScript": "TypeScript is a typed superset of JavaScript developed by Microsoft." },
  { "Scala": "Scala combines object-oriented and functional programming in one high-level language." },
  { "Erlang": "Erlang was developed by Ericsson for use in telecommunication systems." },
  { "Prolog": "Prolog is a logic programming language associated with artificial intelligence." },
  { "MATLAB": "MATLAB stands for 'Matrix Laboratory'." },
  { "SQL": "SQL stands for 'Structured Query Language'." },
  { "Dart": "Dart is used to build mobile, desktop, server, and web applications." },
  { "Elixir": "Elixir runs on the Erlang VM and is known for its scalability." },
  { "Objective-C": "Objective-C was the primary programming language for Apple before Swift." },
  { "Assembly": "Assembly language is a low-level programming language for a computer." },
  { "Shell": "Shell scripting is writing scripts for command-line interpreters." },
  { "BASIC": "BASIC stands for 'Beginner's All-purpose Symbolic Instruction Code'." },
  { "Scratch": "Scratch is a visual programming language targeted primarily at children." },
  { "F#": "F# is a functional-first language on the .NET platform." },
  { "Ada": "Ada was named after Ada Lovelace, often considered the first programmer." },
  { "C#": "C# was developed by Microsoft as part of its .NET initiative." },
  { "Visual Basic": "Visual Basic is derived from BASIC and allows rapid application development." },
  { "Groovy": "Groovy is an object-oriented programming language for the Java platform." },
  { "Lua": "Lua is a lightweight, high-level, multi-paradigm programming language." },
  { "Pascal": "Pascal was designed as a teaching language and is named after Blaise Pascal." },
  { "Julia": "Julia is designed for high-performance numerical analysis and computational science." },
  { "Scheme": "Scheme is a minimalist dialect of Lisp." },
  { "RPG": "RPG stands for 'Report Program Generator' and is used on IBM systems." },
  { "Simula": "Simula is considered the first object-oriented programming language." },
  { "APL": "APL uses a unique set of non-ASCII symbols for operations." },
  { "D": "D language is designed as an improved version of C++." },
  { "Logo": "Logo is known for its turtle graphics used in education." },
  { "Smalltalk": "Smalltalk was influential in the development of object-oriented programming." },
  { "PL/I": "PL/I was designed to combine features from COBOL and Fortran." },
  { "Mercury": "Mercury is a functional logic programming language." },
  { "Hack": "Hack is a programming language developed by Facebook as a dialect of PHP." },
  { "Crystal": "Crystal has syntax similar to Ruby but is statically typed." },
  { "LabVIEW": "LabVIEW is used for data acquisition, instrument control, and industrial automation." },
  { "Q#": "Q# is a quantum programming language developed by Microsoft." },
  { "ABAP": "ABAP is the programming language for SAP application servers." },
  { "OpenCL": "OpenCL is used for writing programs that execute across heterogeneous platforms." },
  { "Max/MSP": "Max/MSP is a visual programming language for music and multimedia." },
  { "Verilog": "Verilog is a hardware description language used in electronic design automation." },
  { "VHDL": "VHDL stands for 'VHSIC Hardware Description Language'." },
  { "OCaml": "OCaml is a general-purpose programming language with an emphasis on expressiveness and safety." },
  { "PowerShell": "PowerShell is a task automation and configuration management framework from Microsoft." },
  { "ActionScript": "ActionScript is used primarily for developing websites and software targeting the Adobe Flash Player platform." },
  { "Nim": "Nim combines successful concepts from mature languages like Python, Ada, and Modula." },
  { "REXX": "REXX is a scripting language developed at IBM that is used for both system and application programming." },
  { "SAS": "SAS is a statistical software suite developed for advanced analytics." },
  { "Tcl": "Tcl stands for 'Tool Command Language' and is often used for rapid prototyping." },
  { "ColdFusion": "ColdFusion is a scripting language used for web development that integrates with Java." },
  { "Solidity": "Solidity is used for writing smart contracts on blockchain platforms like Ethereum." },
  { "Vala": "Vala is designed to bring modern language features to GNOME developers without imposing additional runtime requirements." },
  { "Awk": "Awk is a domain-specific language designed for text processing and typically used as a data extraction and reporting tool." },
  { "Racket": "Racket is a general-purpose programming language as well as the world's first ecosystem for language-oriented programming." },
  { "Inform": "Inform is a design system for interactive fiction based on natural language." },
  { "Pony": "Pony is an open-source, object-oriented, actor-model, capabilities-secure, high-performance programming language." },
  { "Squirrel": "Squirrel is a high-level, imperative, object-oriented programming language designed to be a lightweight scripting language." },
  { "Chapel": "Chapel is a parallel programming language developed by Cray." },
  { "Clojure": "Clojure is a modern, dynamic, and functional dialect of the Lisp programming language on the JVM." },
  { "CoffeeScript": "CoffeeScript is a language that compiles into JavaScript and adds syntactic sugar inspired by Ruby and Python." },
  { "Dylan": "Dylan is a multi-paradigm programming language that includes support for functional and object-oriented programming." },
  { "Eiffel": "Eiffel is an object-oriented programming language developed to enable programmers to create reliable, reusable software." },
  { "Forth": "Forth is a stack-based, extensible language without type-checking." },
  { "GLSL": "GLSL is a high-level shading language based on the C programming language." },
  { "J": "J is a high-level, general-purpose programming language, particularly suited to mathematical and statistical programming." },
  { "ML": "ML stands for 'Meta Language' and is known for its use of the Hindley–Milner type inference algorithm." },
  { "Modula-2": "Modula-2 was designed as a successor to Pascal and is known for its strong typing and modularity." },
  { "NXT-G": "NXT-G is a graphical programming language for the LEGO Mindstorms NXT robotics kit." },
  { "Oberon": "Oberon is a programming language created as part of the Oberon operating system." },
  { "PL/SQL": "PL/SQL is Oracle Corporation's procedural extension for SQL and the Oracle relational database." },
  { "S": "S is a statistical programming language and the precursor to R." },
  { "Xojo": "Xojo is a cross-platform development tool for creating apps for desktop, web, and iOS." },
  { "Zsh": "Zsh is a shell designed for interactive use, although it is also a powerful scripting language." },
  { "AutoHotkey": "AutoHotkey is a free, open-source scripting language for Windows that allows users to automate any desktop task." },
  { "Elm": "Elm is a domain-specific programming language for declaratively creating web browser-based graphical user interfaces." },
  { "Factor": "Factor is a stack-oriented programming language with a focus on simplicity and performance." },
  { "Red": "Red is a programming language designed to overcome the limitations of the Rebol language." },
  { "Idris": "Idris is a purely functional programming language with dependent types." },
  { "Ballerina": "Ballerina is an open-source programming language for the cloud that makes it easier to use, combine, and create network services." },
  { "Oxygene": "Oxygene is an Object Pascal-based programming language from RemObjects Software." },
  { "Zig": "Zig is a general-purpose programming language and toolchain for maintaining robust, optimal, and reusable software." },
  { "QlikView": "QlikView is a business intelligence tool for data integration, conversational analytics, and data visualization." },
  { "Monkey": "Monkey is a programming language that targets mobile platforms, including Android and iOS." },

  
];


function give_random_fact(){
  const randomIndex = Math.floor(Math.random() * facts.length);
  const selectedFact = facts[randomIndex];
  const [language, fact] = Object.entries(selectedFact)[0];
  return fact;
}


export const LoadingComponent = () => {
  const [randomFact, setRandomFact] = useState("");
  const [loadingText, setLoadingText] = useState("Loading");
  const [oCount, setOCount] = useState(1); // Initial "o" count

  useEffect(() => {
    setRandomFact(give_random_fact());

    // Change the fact every 5 seconds
    const factInterval = setInterval(() => {
      setRandomFact(give_random_fact());
    }, 5000);

    // Increment the number of "o"s every second
    const loadingInterval = setInterval(() => {
      setOCount(prevCount => prevCount + 1);
    }, 1000);

    return () => {
      clearInterval(factInterval);
      clearInterval(loadingInterval);
    };
  }, []);

  useEffect(() => {
    // Update the loading text with the appropriate number of "o"s
    setLoadingText(`L${"o".repeat(oCount)}ading...`);
  }, [oCount]);

  return (
    <div className="loading-container">
      <div className="loading">{loadingText}</div>
      <div className={`loading-fact`}>{randomFact}</div>
    </div>
  );
};