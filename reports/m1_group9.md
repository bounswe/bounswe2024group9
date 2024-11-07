# Deliverables

 - [Software Requirements Specification](https://github.com/bounswe/bounswe2024group9/wiki/451-%E2%80%90-Requirements)
 - [Software Design (UML diagrams)](https://github.com/bounswe/bounswe2024group9/wiki/451-%E2%80%90-Design-Diagrams)
- [Scenarios](https://github.com/bounswe/bounswe2024group9/wiki/451-%E2%80%90-Scenarios) and [Mockups](https://github.com/bounswe/bounswe2024group9/wiki/451-%E2%80%90-Mockups)
- [Project Plan](https://github.com/user-attachments/files/17269124/451.Group.9.pdf), [Communication Plan](https://github.com/bounswe/bounswe2024group9/wiki/Communication-Plan), [Responsibility Assignment Matrix](https://github.com/bounswe/bounswe2024group9/wiki/Responsibility-Assignment-Matrix)

- Meeting Notes:

- [Meeting Notes #3 - 15.10.2024](https://github.com/bounswe/bounswe2024group9/wiki/Meeting-notes-%233-15.10.2024)
- [Meeting Notes #2 - 08.10.2024](https://github.com/bounswe/bounswe2024group9/wiki/Meeting-notes-%232-08.10.2024)
- [Lab Meeting Notes #1 - 24.09.2024](https://github.com/bounswe/bounswe2024group9/wiki/Lab-Meeting-Notes-%231)
- [Meeting Notes #1 - 26.09.2024](https://github.com/bounswe/bounswe2024group9/wiki/Meeting-Notes-%231-%E2%80%90-26.09.2024)

- Lab Reports:

- [Lab Report #1](https://github.com/bounswe/bounswe2024group9/wiki/Lab-Report-1-%E2%80%90-24.09.2024)
- [Lab Report #2](https://github.com/bounswe/bounswe2024group9/wiki/Lab-Report-%232-%E2%80%90-01.10.2024)
- [Lab Report #3](https://github.com/bounswe/bounswe2024group9/wiki/Lab-Report-%233)
- [Lab Report #4](https://github.com/bounswe/bounswe2024group9/wiki/Lab-Report-%234)

# Milestone Review 
- A summary of the project status and any changes that are planned for moving forward:

 -- Currently, the web part of the project includes registration and login sections, a temporary feed, question display and code execution API usage sections. In the mobile section, there are sections for registering, logging in, viewing questions and commenting. In the future, when executing the code, we will determine the code beginning and ending parts of the shared post ourselves and send them to the API, free of normal sentences. Currently, shared posts are not automatically registered in the database. In the future, each post will be saved in its database with the ID of the user who shared it and can be viewed when their profile is entered. In this way, users will be able to edit and delete their posts. In addition, users' plus-minus scores can be displayed and there will be the ability to vote for other users in the same way. All of these features will be active on both the website and mobile application.

 - A summary of the customer feedback and reflections:

-- We held our first customer presentation on Tuesday, 22.10.2024, 4.30 p.m. There was a slight delay -around 15 mins- due to the technical issues that the groups encountered before us. During our presentation, we thoroughly explained the purpose of the project and its name origins. Then we continued through one of our user scenarios and demonstrated every functionality we have implemented so far.
At the end of out prensentation, one of the customer feedbacks we have recieved from Suzan hoca was about the domain of our app. The app is currently seems like it's focused mainly on computational aspects of the programming languages. However, our customer would like to see contents including conceptual aspects of programming in general in the app as well. Our system should recognize more conceptual and scientific contents such as recursions and loops, why and when they are useful, what are the thoretical differences between programming languages etc. Based on the feedback we get, we have already started to widen our content domain. We have added more conceptual labels that users can add to their posts and when user clicks to these labels, they will be redirected to a page including detailed information about those concepts. Also we are planning to implement search functionality as it will cover for programming concepts.
 -- Another feedback we have recieved from one of our customers, Kutay, was about the security concerns in code execution functionality. According to the feedback, we need to determine a measure for malicious codes in our code execution part, otherwise this would be a huge security issue and can be exploited. Based on the feedback we get, we have started on researching exploitation detection algorithms and 3rd party providers. Addressing the security concerns of our customer will be the top priority for us for our upcoming milestones.



 - List and status of deliverables:
 
| **Deliverable** | **Status** |
| ------------------- | --------------------- | 
| Software Requirements Specification | [Done](https://github.com/bounswe/bounswe2024group9/wiki/451-%E2%80%90-Requirements) |
| Software Design | [Done](https://github.com/bounswe/bounswe2024group9/wiki/451-%E2%80%90-Design-Diagrams) |
| Scenarios and Mockups | [Done](https://github.com/bounswe/bounswe2024group9/wiki/451-%E2%80%90-Scenarios) |
| [Project Plan](https://github.com/user-attachments/files/17269124/451.Group.9.pdf), [Communication Plan](https://github.com/bounswe/bounswe2024group9/wiki/Communication-Plan),[ Responsibility Assignment Matrix](https://github.com/bounswe/bounswe2024group9/wiki/Responsibility-Assignment-Matrix)  | Done |
| Weekly reports and any additional meeting notes  | [Done](https://github.com/bounswe/bounswe2024group9/wiki) |
| Milestone Review  | Done |
| Individual Contributions | 2/10 Done |
| A pre-release version of your software | [Done](https://github.com/bounswe/bounswe2024group9/releases/tag/customer-milestone-1) |


 - Evaluation of the status of deliverables and its impact on your project plan (reflection):
 -- Although there is still a lot to cover, we believe we have come a long way. Specifying the [requirements](https://github.com/bounswe/bounswe2024group9/wiki/451-%E2%80%90-Requirements) beforehand has helped us a lot to keep things organized and makes it really clear to see which necessities are implemented and which are not. Similarly, the design diagrams are handy when it comes to writing the actual functions.
 -- When compared to the long-term plan we created in the beginning of the semester, there have been changes. While some parts are behind schedule (such as the functionalities on web), some are ahead of schedule (such as the functionalities on mobile, dockerization, deployment). These changes are due to unexpected requirements for this customer milestone, the splitting of tasks across mobile and web for a more effective demo, and delays due to incredible course load in general. After this milestone, we will be working towards completing the remaining tasks and getting back on track. 
 - Evaluation of tools and processes used to manage team project:
 -- Project Libre was used for the general long-term plan. While it provides good UI to the person creating the project, it is hard to share and get input from multiple students. We shall research better options to include teamwork.
 -- Issues and PRs in GitHub were the major communication platform in our team. They are a great tool since they are directly related to code and other changes, but also easy to track. We were always aware of the current status and plans thanks to them and we plan to continue using them as effectively as possible. 
 -- The RAM was helpful in the initial plan and keeping up with the responsibilities. However, once we had definite large roles and everyone working in their own area it became more redundant. For example, ideally people assigned to web front end keep moving towards reaching the final design without being assigned/reassigned to other responsibilities.
 -- The weekly labs serve as our weekly meetings with the team. There we use the lab description to evaluate our status and plans both for the day and the week. Besides that we keep communicating and working tightly in pairs or smaller groups.
 
- The [requirements](https://github.com/bounswe/bounswe2024group9/wiki/451-%E2%80%90-Requirements) addressed in this milestone:
-- Post creation requirements - users can create new posts on the mobile forum and add code snippets while choosing the relevant programming language
(1.1.1.1, 1.1.1.2, 1.1.1.3)
-- Feed requirements - users can see other posts on mobile sorted by the date of creation (1.1.2.2.3)
-- Commenting Requirements - users can comment on a post in mobile, users can execute code snippets in the comments section on both mobile and web (1.1.4.1, 1.1.4.5)
-- Code snippet requirements - Code snippets are executed in a secure, isolated environment to prevent malicious activities(1.1.5.2)
-- Browsing Programming Languages - Users can search for information on programming languages from wikidata together with filters and suggestions (1.1.6.1, 1.1.6.2, 1.1.6.5)
-- Sign up and Log in - Users can sign up and log in on both mobile and web (1.1.8.2, 1.1.8.3, 1.1.8.4, 1.1.8.6)
-- Browsing Programming Languages Functionality - back end API done, implemented in mobile (1.2.1.1, 1.2.1.2, 1.2.1.3, 1.2.1.5)
-- Security - hints for password creation (2.1.4)
-- Availability - available on mobile and web (2.3.1)






# Individual Contributions 
#### Kristina Trajkovski 

- Responsibilities: long-term plan;  code execution and forum details page's requirements, mockups, scenarios, and design diagrams; Wikidata API - back end; 
- Main contributions: 
 --  Wrote the requirements, created mockups, scenarios, and design diagrams for forum details and code execution [#202](https://github.com/bounswe/bounswe2024group9/issues/202)
 -- Created long-term plan in Project Libre stating private and course milestones and some known assignments [#205](https://github.com/bounswe/bounswe2024group9/issues/205)
 -- Created a django skeleton used later in our project by all and tested it with a simple Wiki query [PR #210](https://github.com/bounswe/bounswe2024group9/pull/210)
 -- Created Wikidata queries for searching programming languages and filtering according to preferences [#211](https://github.com/bounswe/bounswe2024group9/issues/211)
-- Reviewed and test Judge0 code execution API by Serhan [PR #213](https://github.com/bounswe/bounswe2024group9/pull/213)
-- Review and test Wikipedia fetching used in Wiki result display by Damla [PR #214](https://github.com/bounswe/bounswe2024group9/pull/214)
-- Implemented Wikidata search and result API showing results of programming languages search, related references, and other data [#222](https://github.com/bounswe/bounswe2024group9/issues/222), [PR #223](https://github.com/bounswe/bounswe2024group9/pull/223)

- Code-related significant issues: 
 -- One of the significant issues I have resolved right before the demo was the [wiki fix](https://github.com/bounswe/bounswe2024group9/tree/wiki-fix). It happened similarly to [this stack overflow post](https://stackoverflow.com/questions/61803586/wikidata-forbidden-access0). We were randomly banned from sending queries to Wikidata and that was temporarily bypassed by adding an agent to the SPARQL wrapper.
 -- Another one was simply building the right query which would result in the desired result as soon as possible. This was solved with a lot of filtering and testing in [PR #223](https://github.com/bounswe/bounswe2024group9/pull/223)
 -- Noticed that the offered languages in Judge0 would not be easy for users and discussed better UI options such as drop down menus  with Serhan in [PR #213](https://github.com/bounswe/bounswe2024group9/pull/213)
- Non-code-related significant issues: 
-- There were missed personal deadlines both by myself and my team mates, but we are all dealing with a very exhausting semester and do our best to give updates and contribute. 
-- There was a change of plans in assignments. Namely, I was going to contribute to mobile's front end, however due to my expertise in Wiki queries and Halil's in mobile, we have decided that due to a tight schedule it is the best for all of us if we direct our knowledge into what we do the best. 
-- The workload in our team was again not evenly distributed. While we attempt to share the load evenly in our planning stages, there is always a small number of students who take on more than they should. I see this as an unresolved non-code-related issue and hope everyone either receives what they deserve or pick up the missing pieces. 
- Pull requests: 
-- My merged PRs: [#236 - redo wiki search ](https://github.com/bounswe/bounswe2024group9/pull/236), [#223 - create Wiki queries](https://github.com/bounswe/bounswe2024group9/pull/223), [#210 - create Django project](https://github.com/bounswe/bounswe2024group9/pull/210)
-- We are still learning how to use GitHub, so my code accidentally got deleted twice - one by a team mate closing my PR instead of merging at [PR #210](https://github.com/bounswe/bounswe2024group9/pull/210), and one by a poorly handled code conflict in [PR #221](https://github.com/bounswe/bounswe2024group9/pull/221) resulting in my redoing of the Wiki queries in [PR #236](https://github.com/bounswe/bounswe2024group9/pull/236). These mistakes made us more careful when reviewing and merging. 

- Additional information: 
 -- Although this is often neglected, I usually prepare the template for reports (such as this one) together with answers and links to general group contributions. I believe this should be listed as a significant part of the workload together with other documentation and "administrative" work.


#### Serhan Çakmak

- Responsibilities: code execution and forum details page's requirements, mockups, scenarios, and design diagrams; Judge0 API - back end - front end; 
- Main contributions:
 --  Wrote the requirements, created mockups, scenarios, and design diagrams for forum details and code execution [#203](https://github.com/bounswe/bounswe2024group9/issues/203)
 -- Documented my findings about Judge0 API, connected back-end side to the Judge0 api server, constructed a simple html web page as an outline to display which functionalities of the API can be used (dropdown menu for the languages, code execution input box, and output displayer), implemented the main function of code execution with the test cases, added requirements.txt and readme files (both of them were updated in the later commits). [PR #213](https://github.com/bounswe/bounswe2024group9/pull/213) 
 -- Created user authentication system, which made it possible for us to restrict the access of endpoints; added login and signup functionality to the back end, added simple front end pages to test the functionalities. The main reason to implement temporary login and signup pages was to make sure that authentication system works properly before the actual implementation of aforementioned pages. [PR #221](https://github.com/bounswe/bounswe2024group9/pull/221)
 -- Reviewed and tested database connection pr by Mutti [PR #217](https://github.com/bounswe/bounswe2024group9/pull/217)
 -- Discussed the implementation details with Mutti [#229](https://github.com/bounswe/bounswe2024group9/issues/229) 
 -- Reviewed and tested endpoints by Damla and Mutti [PR #237](https://github.com/bounswe/bounswe2024group9/pull/237)
 -- Modified the functionalities to facilitate the connection between both  code_execution/database and code_execution/front-end. Made the code execution page dynamic; even though, it wasn't my duty to handle this in the front end side. [PR #245](https://github.com/bounswe/bounswe2024group9/pull/245) 
 -- Reviewed, tested, and added new functionality to some of the functions in [PR #236](https://github.com/bounswe/bounswe2024group9/pull/236)

- Code-related significant issues:
-- One of them stemed from the lack of communication between the front end and back end side. Since the front-end side hadn't been implemented at that time the solution was decided to go with the [authentication pr](https://github.com/bounswe/bounswe2024group9/pull/221) after testing the functionality. However, after connecting back end to front end, the code didn't perform the desired utility. Thus authentication will be re-implemented in the future. 

- Non-code-related significant issues:
-- Even though the work load was splitted evenly among the group members, some group members had to work harder than it was initially intended.


- Pull requests
-- My merged PRs: [#213 - Code Execution API](https://github.com/bounswe/bounswe2024group9/pull/213), [#221 Create User Authentication system](https://github.com/bounswe/bounswe2024group9/pull/221)
-- Contributed directly to  [#245 - Web front back connection](https://github.com/bounswe/bounswe2024group9/pull/245), [#236 - redo deleted wiki search and result components](https://github.com/bounswe/bounswe2024group9/pull/236)

#### Halil Karabacak
- Responsibilities: requirements, mockups, and design diagrams of feed and post creation with Ceylin; development of mobile application including post creation, login, signup, question details (comment addition & code execution) and feed. Debugging my own issues and approving my own PRs.

- Main contributions: 
 --  Write the requirements, create mockups, and design diagrams for feed page and post creation. [#208](https://github.com/bounswe/bounswe2024group9/issues/208)
 -- Create a mobile application using React Native and Android Studio. [#218](https://github.com/bounswe/bounswe2024group9/issues/218)
 -- Wrote endpoints for feed and fetching comments of a specific post from database to our model. [PR241](https://github.com/bounswe/bounswe2024group9/pull/241/files)
-- Implemented mobile login and signup pages. [PR235](https://github.com/bounswe/bounswe2024group9/pull/235/files)
-- Implemented mobile feed and question details pages. [PR239](https://github.com/bounswe/bounswe2024group9/pull/239/files)
-- Implemented mobile search and post creation pages. [PR240](https://github.com/bounswe/bounswe2024group9/pull/240/files)
-- Connected mobile app to backend and deployed a release APK.

- Non-code-related significant issues:
-- Nothing much. But personally I was a little (or too i don't know) late to share the mobile project with Kristina and this resulted in a shift of workload. Since we were running out of time, we decided to go for a "do what you can do" and skipped the part where Kristina were developing a mobile search page and I were contributing some stuff than implementing those pages. I am sure that we will resolve this issue. 

- code-related significant issues:
-- Nothing much, everything went well in terms of development of the app.


- Pull requests: 
-- My merged PRs: [#235 - mobile login & signup ](https://github.com/bounswe/bounswe2024group9/pull/235), [#239 - mobile feed and question details](https://github.com/bounswe/bounswe2024group9/pull/239), [#240 - mobile search result & post creation](https://github.com/bounswe/bounswe2024group9/pull/240), [#241 - mobile backend connection](https://github.com/bounswe/bounswe2024group9/pull/241)


#### Mustafa Atak

- Responsibilities: search result and forum page's requirements, mockups, and design diagrams; Backend for mobile and web. Debugging team issues.

- Main contributions: 
 --  Write the requirements, create mockups, and design diagrams for searching question and seeing the results [#204](https://github.com/bounswe/bounswe2024group9/issues/204)
 -- Create a AWS subscription from start and connect it to create a database for our django project and make it accessible to everyone . [#216](https://github.com/bounswe/bounswe2024group9/issues/216)
 -- Remove some unnecessary parts like issue templates that were forgotten from CMPE352 [#225](https://github.com/bounswe/bounswe2024group9/issues/225)
 -- Creating User, Question and Comment models and restructing them. Utilizing code execution API into the models. [PR217](https://github.com/bounswe/bounswe2024group9/pull/237/files)
 -- Wrote endpoints for creating user, comment, question, logging in the user, listing questions by their tag in order to implement filter functionality. [PR217](https://github.com/bounswe/bounswe2024group9/pull/237/files)
-- Deploying the backend with DigitalOcean platform. [#228](https://github.com/bounswe/bounswe2024group9/issues/228)

- Non-code-related significant issues:
-- Sometimes it is more useful to help interested teammates understand the code and the logic better than adding a line of code.
-- Tested and helped my friends to resolve their issues. [#229](https://github.com/bounswe/bounswe2024group9/issues/229)

- Pull requests: 
-- My merged PRs: [#236 - redo wiki search ](https://github.com/bounswe/bounswe2024group9/pull/236), [#223 - create Wiki queries](https://github.com/bounswe/bounswe2024group9/pull/223), [#210 - create Django project](https://github.com/bounswe/bounswe2024group9/pull/210)


#### Damla Kayıkçı

- Responsibilities: api endpoints, dockerization,  scenarios, and design diagrams
- Main contributions:
    --  Wrote the requirements, scenarios, and design diagrams for forum details and code execution [#209](https://github.com/bounswe/bounswe2024group9/issues/209)
    -- Wrote the endpoint for fetching data from Wikipedia . [PR #214](https://github.com/bounswe/bounswe2024group9/pull/214) 
    -- Updated Wikidata queries for searching programming languages and filtering according to preferences by Kristina & reviewed it. [PR #211](https://github.com/bounswe/bounswe2024group9/pull/211) 
 -- Wrote endpoints for filtering questions and code execution and modified other endpoints. [PR #225](https://github.com/bounswe/bounswe2024group9/pull/225)
 -- Wrote code for Dockerizing project [PR #2228](https://github.com/bounswe/bounswe2024group9/pull/228)
 


- Code-related significant issues:
-- For me the most significant one was the dockerization, since I had never done it before I had to make a detailed research and try testing it quite a few times both for frontend and backend. However, after discussing the errors with Mutti, I succeeded [docker pr](https://github.com/bounswe/bounswe2024group9/pull/228).
 -- Second one was about signing up feature. We spent a lot of time with Mutti to figure out why sign up didn't function until we found out that it was a simple naming mismatch between front-end and back-end

- Non-code-related significant issues:
-- We had some issues in division of labor. However, this was something expected and I think we will get better as we begin to get used to each other and our working styles


- Pull requests
-- My merged PRs: [#244 - Dockerize  API](https://github.com/bounswe/bounswe2024group9/pull/244), [#214 fetching data from wikipedia ](https://github.com/bounswe/bounswe2024group9/pull/214)
-- Contributed directly to  [#237 - Models and endpoints implemented on the backend](https://github.com/bounswe/bounswe2024group9/pull/237)

#### Ceylin Gebeş
- Responsibilities: responsibility assignment matrix; requirements, mockups, and design diagrams of feed and post creation pages with Halil; development of web application frontend, more specifically authentication-related pages login, signup, forgot password and feed.

- Main contributions: 
 --  Write the requirements, create mockups, and design diagrams for feed and post creation pages [#207](https://github.com/bounswe/bounswe2024group9/issues/207), [mockup](https://github.com/bounswe/bounswe2024group9/wiki/451-%E2%80%90-Mockups#web-2), [diagrams](https://github.com/bounswe/bounswe2024group9/wiki/451-%E2%80%90-Design-Diagrams#26-feed)
 -- Created Responsibility Assignment Matrix [#215](https://github.com/bounswe/bounswe2024group9/issues/215), [RAM](https://github.com/bounswe/bounswe2024group9/issues/215)
 -- Initialized the web application for web frontend and implemented initial versions of login, signup, forgot password, feed pages [#226](https://github.com/bounswe/bounswe2024group9/issues/226), [a6681ce](https://github.com/bounswe/bounswe2024group9/commit/a6681cedc2c81be0ea13113336eb5399226b8d6e)
 -- Implemented the feed page for the web application according to the mockup [#226](https://github.com/bounswe/bounswe2024group9/issues/226), [6c5f7d4](https://github.com/bounswe/bounswe2024group9/commit/6c5f7d418dabf6c8b6da03c54e6974cde8c21fe6)
 -- Connected web pages according to the flow [dbeae31](https://github.com/bounswe/bounswe2024group9/commit/dbeae3119286914e9e5e120c3b0f8d07cf9a1807)
 -- Implemented an initial version of search results page so my teammate assigned to this have an easy starting point [6a08537](https://github.com/bounswe/bounswe2024group9/pull/243/commits/6a08537e10c26ffb6c470ad940802798aaaf9f31)
 -- Attempted to solve issues regarding connecting backend and frontend, especially CORS-related issues with Mutti [PR #243](https://github.com/bounswe/bounswe2024group9/issues/243), [0b6f96b](https://github.com/bounswe/bounswe2024group9/pull/243/commits/0b6f96b8b02c4906d91ab77b3ba4cc05e82d4699), [da53cc2](https://github.com/bounswe/bounswe2024group9/pull/243/commits/da53cc2b74f53cf18ea82417cf9b7b8caac72b49)
 
 - Additional information:
 -- Tested Dockerization and deployment with Damla
 -- Designed a logo for our project :) [see here](https://github.com/bounswe/bounswe2024group9/tree/main/koduyorum-web/public/resources)
 -- Wrote customer feedback notes section on this report
 
 
 
 - Code-related significant issues:
 -- Since we are still not proficient using Github, we were a lot confused for a longish time whether we should merge one of my pull requests or not with my teammate Eray. We were expecting to resolve some conflicts in [PR #231](https://github.com/bounswe/bounswe2024group9/pull/231), we encountered with no merge conflicts and end up very confused. Thus, we canceled this PR and consulted to one of our more experienced teammates and reopened a new PR. But we learned our lesson, not every overwriting situations shows up as a conflict.
 
 - Non-code-related significant issues:
 -- There was some communication issues we have encountered. Even though we split work on the meetings, we were unable to reach out to our teammate at all despite several attempts through several channels and keep updated about what is completed and what is not in one of the pages. This was hard to manage since we all were working with a tight schedule and trusted everyone sticks to the plan and some of our friends needed to step up for undone work and take extra responsibility just before presentation. But I think we need to take some serious actions or come up with a backup plan for upcoming milestones to this never to be happen again.
 -- Even though we were unable to interfere legal decisions, restrictions on Discord was challenging for us. We had a really nicely organized server for our group there and we were using Discord for both communicating and keeping important documents where everyone can access easily. With the closure of Discord, we needed to switch communication channels and documentation place.
 
 
 - Pull requests:
 -- PRs created by me: [PR #246](https://github.com/bounswe/bounswe2024group9/pull/246), [PR #231](https://github.com/bounswe/bounswe2024group9/pull/231)
 -- PRs merged by me: [PR #232](https://github.com/bounswe/bounswe2024group9/pull/232), [PR #233](https://github.com/bounswe/bounswe2024group9/issues/233)
 -- PRs reviewed by me: [PR #228](https://github.com/bounswe/bounswe2024group9/issues/228)
 -- Contributed directly to: [PR #227](https://github.com/bounswe/bounswe2024group9/pull/227), [PR #234](https://github.com/bounswe/bounswe2024group9/issues/234), [PR #242](https://github.com/bounswe/bounswe2024group9/issues/242), [PR #243](https://github.com/bounswe/bounswe2024group9/issues/243)
 






#### Eray Eroğlu
- Responsibilities: Requirements, mockups, and design diagrams of code execution and search pages with Mutti; development of web application frontend, more specifically authentication-related pages login, signup, feed, search and code execution.

- Main contributions: 
 --  Write the requirements, create mockups, and design diagrams for code execution and search pages [#204](https://github.com/bounswe/bounswe2024group9/issues/204)
 -- Implemented the initial versions of web applications specifically login, signup, search and code execution pages [#226](https://github.com/bounswe/bounswe2024group9/issues/226)
 -- Login/signup and backend integration [#PR 227](https://github.com/bounswe/bounswe2024group9/pull/227)
 --Sync between different web pages [#PR 232](https://github.com/bounswe/bounswe2024group9/pull/232)
 --Integration of code execution page pages with search page [#PR 233](https://github.com/bounswe/bounswe2024group9/pull/233)
 --Implementing the transition among web pages [#PR 234](https://github.com/bounswe/bounswe2024group9/pull/234)
 --Integrating the latest changes at backend with the web app [#PR 245](https://github.com/bounswe/bounswe2024group9/pull/245)
 --Final bug fix and the latest version of web app [#PR 248](https://github.com/bounswe/bounswe2024group9/pull/248)
 
 
 - Code-related issues:
    Learning how to use a new API for code execution was a time consuming task. Also syntax highlighting for different programming languages is another challange which we did not handle yet, we have only a syntax highlighter for JavaScript language. In addition to them, showing the output of a code snippet required some design updates, it was not an issue but it created workload. Since I focused on frontend of web application, most of the issues I encountered were related to them.
    
- Non code-related issues:
    Division of tasks. I hope it will get better for the second milestone
    
- Merged PRs : 
    [#PR 227](https://github.com/bounswe/bounswe2024group9/pull/227), [#PR 232](https://github.com/bounswe/bounswe2024group9/pull/232), [#PR 233](https://github.com/bounswe/bounswe2024group9/pull/233), [#PR 234](https://github.com/bounswe/bounswe2024group9/pull/234), [#PR 245](https://github.com/bounswe/bounswe2024group9/pull/245), [#PR 248](https://github.com/bounswe/bounswe2024group9/pull/248)
    

#### Mehmet Emin İpekdal
- Responsibilities: Sign up, login/logout and profile pages’ requirements, mockups, scenarios, and design diagrams. Backend for user authorization system, frontend for signup and login/logout pages.
- Main contributions:
 --  Wrote the requirements, created mockups, scenarios, and design diagrams for sign up, login/logout and profile pages [#206](https://github.com/bounswe/bounswe2024group9/issues/206)
 -- Checked the differences between this year’s frontend/backend codes and yesterday’s project in order to understand the endpoints, API calls, database calls. I could not make any contributions to main code since I could not resolve some problems with my Intel MacBook Pro. I will repay my lack of contributions in the second milestone.
- Code-related significant issues:
-- Since I recently reset my computer, I constantly received errors that some modules were missing. When I get these errors in the terminal, the suggested solutions are already coming, but I was suggested to reinstall the things I had previously installed. When I looked on the internet, I saw similar things. I tried to solve four or five different problems for more than 10 hours. Of course, these are not excuses, I will try to cover my shortcomings in the next milestone.

- Non-code-related significant issues:
-- When the requirements and diagram tasks distribution was made, I was in a group with a friend who had not yet taken the course. Afterwards, that friend couldn't enroll in the course, so I had to do all the work.



# [pre-release version](https://github.com/bounswe/bounswe2024group9/releases/tag/customer-milestone-1) 