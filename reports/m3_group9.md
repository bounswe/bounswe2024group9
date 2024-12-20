# Executive summary

## Summary of Project Status

- Overall, we successfully addressed many of our initial goals by developing a platform tailored for code enthusiasts, enabling users to ask questions and experiment with code snippets directly on the site.From the planning phase through to the milestones, our focus shifted based on feedback to enhance user experience, including the addition of features like annotations and user specific content, while also improving our testing coverage. In the current version, we constructed a working app with the following general points to be improved in the future: 
-- question search 
-- more comprehensive programming language information page including conceptually relevant languages, historical development of the languages over time

Note: More detailed information about the status of the project can be found in the later sections.


## Status of the Deliverables

| Deliverable                                                    | Status    | Comment                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| UX design with focus on domain-specific nature of the features | Completed | Pagination feature which controls the questions list is added to frontend. Users are able to display discussion posts rendered differently, create discussion posts and use the enhanced app. Searching mechanism is also updated letting users search for other users. Comments in Profile are now clickable and navigate to question page. Upvote downvote logic is implemented. Code execution output boxes are seperated for comments. Line numbers are added for both web and the mobile app for the code-execution part. |
| Standard                                                       | Completed | Annotation creation implemented on both web and mobile devices, including a new database and the database router itself, as well as editing, deleting, and visibility for other users. Furthermore, annotation feature for both the text part and the code part of the questions and the comments is implemented and tested.                                                                                                                                                                                                   |
| API Documentation                                              | Completed | The implementation always contained well detailed comments, swagger documentation added for almost all the functions in between second and final milestone with [this PR](https://github.com/bounswe/bounswe2024group9/pull/320).                                                                                                                                                                                                                                                                                              |
| Testing                                                        | Completed | More integration tests and unittests are added for fully coverage of the functionalities.                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| General Project Status                                         | Completed | Since milestone 2; many functions that did not work in the background (such as bookmark, view bookmarks - annotations in profile, upvoting/downvoting) or had errors were implemented. Searching algorithm is enhanced, annotations for both in web and mobile is implemented. Pagination is also implemented. New 'annotations' app and database is added. Post filtering feature by status, tags, languages, date, and sorting by popularity is also added.                                                                  |

## Final Release Notes

- In the final version of the application, the biggest improvement compared to the latest milestone was the implementation of the Annotation standard. Most of our work focused on developing the Annotation mechanisms in both the frontend and backend. Additionally, after receiving feedback for Milestone 2, we separated the Annotation server from our backend server, as this was a requirement for adhering to the standard. The utilities of the standard are present in both the mobile and web applications. While there are minor differences in terms of UI/UX, both platforms support the same features.


- In addition to the Annotation feature, we improved the user profile page. A bookmark feature was added to the mobile app, and the UI for this feature was enhanced in the web app. Users can now navigate directly from the profile page to a posted or commented question, providing a better user experience.

- We also made updates to the Feed page and the search mechanism. Features such as searching questions by tags and filters, searching for different users, and filtering questions by time and popularity were implemented in both the backend and frontend. However, some of these updates were not ready until the last minute, and a final-hour merge broke the search mechanism completely. We didn’t have time to identify the problem, so we had to revert to an older version of the search logic. Even though the updates worked independently, we were unable to present them.

- Another issue, which was also mentioned during the presentation, was that we couldn’t achieve a consistent UI between the mobile app and the web app. We didn’t have enough time to update one to match the other.

- Overall, the final version could have been better, as we were unable to showcase all the implemented features. However, we delivered a functional application where people interested in software development and computer science can interact with each other and enjoy the experience.


## Changes in Development Progress

- We had planned to implement a ranking system where active users would have a higher status than others. These users would be entitled to mark questions as answered/unanswered or delete them if they included harmful code snippets. However, we didn’t even start the implementation due to a lack of time.
- We initially had an AI-powered system that checked question titles, contents, and code snippets for malicious use, but we removed it after receiving feedback for Milestone 2.
- We shifted our focus to the Annotation feature. At first, we planned to use other standards and researched them. However, after realizing that most of the other groups were following the Annotation standard, we decided to adopt it as well.
- At the beginning of the semester, we thought that enabling login via Google and GitHub would be a good feature. However, after an internal discussion, we decided it wasn’t worth the effort and chose not to implement it

## Reflections from the Final Milestone and Lessons Learned

- Before the demo, we had way too many things to do and truly not enough time to complete our tasks. In addition to this, tasks were procrastinated until the last moment by some team members. For this reason, we had some last-minute merges (some even without proper review) which ended up causing trouble in our app. A lesson learned from this situation is that we should definitely complete our tasks in a timely manner, be honest about our progress, ask for review and appreciate negative feedback on it.

- After a question coming from an assistant during our final demo, we have noticed that the web representation of our system does not exactly align with the mobile one. For example, we display a leaderboard on the web but not on mobile. For this reason, a user would feel like they are using different apps instead of a single one. We learned that we should check in on each other more and modify our work accordingly instead of blindly focusing on our work. 

- Overall, we are proud of the work that we have accomplished during this semester. It was not perfect as the weight was not distributed nor acknowledged equally among team members, but at last we are submitting a functional app which would bring software enthusiasts together. 

## What Could Have Been Done Differently?

- The work load could have and should have been spread more equally. While some team members were spread across many topics and subteams, some had close to no contributions. This could have been solved by better management and faster intervention with the teaching staff.

- If we had more time, we would make sure to take in the feedback and make searching tags semantic (for example, when searching for functional languages through a tag we should also se questions and descriptions of Haskell).

- Lastly, we could have prepared better for our demos. We are aware that we were not always consistent and providing the best flow of stories that would showcase our features. Still, we did the best that we could with the time that we were given and the technical struggles arising.


# Progress Based on Teamwork


## Summary Table

| Name| Work  | Status | Comment | 
|-------|-----------------------------------------|----------|-----------------|
|Serhan| Annotations in question page| Completed|
|Serhan| Implementation of Bookmarks| Completed|
|Serhan| Authentication| Completed| We might allow users without an account to use the website apart from the code execution and comment/question posting functionalities.
|Serhan| Code Execution| Completed|
|Serhan|  Unit testing for question and utilities view functions| Completed| More integration tests can be added involving new functionalities.|
|Serhan| Comments in front end| Completed|
|Kristina| Annotations in Search Results | Completed | Another upgrading feature could have been hiding/showing annotations, replying to annotations, etc.|
|Kristina| Wikidata Searching End Points| Completed | |
|Kristina | Wikidata front end enhancement | Completed | |
|Kristina | Long-term plan | Completed | Could have been better with up-to-date issue opening by all team members.|
|Kristina | Unit tests, integration test, user test of above mentioned tasks||
|Kristina| Annotations in Search Results | Completed | Another upgrading feature could have been hiding/showing annotations, replying to annotations, etc.|
|Eray| Feed Page | Completed | |
|Eray | Question Page | Completed | |
|Eray | Syntax Highlighting | Completed | Implementation only covers mainstream languages, could be better if a custom one is implemented|
|Mutti | CRUD endpoints for models | Completed (for current Task Status) | Since each new task requires a new endpoint and the tasks are not completed, it can never be said to be finished, but the endpoints for all given tasks are completed. |
|Mutti | Deployment and Database Changes | Completed | |
|Mutti | Swagger Documenting | Completed | Due to django's API protection rules, remote cannot be opened, but you can access all of them by running them locally and going to the /swagger endpoint.|
|Mutti | Filtering for Frontend and Backend | Completed ||
| Ceylin | Login page in web | Completed | |
| Ceylin | Signup page in web | Completed | |
| Ceylin | Feed page in web | Completed | Created general structure of the feed page, implemented question of the day, navigation bar, top contributors and popular tags etc. |
| Ceylin | Post creation page in web | Completed | |
| Ceylin | Profile page in web | Completed | I have implemented all of the necessary funcionalities for profiles like editing username password and bio, deleting account, displaying posts of this user etc. But it would be nicer if we added more complex functionalities like reporting a profile or adding friends etc. |
| Ceylin | Annotations in search results in web | Completed | It would be cool also if we implement comments on annotations as well. |
| Ceylin | Discussion type posts in web | Completed | Implemented discussion type posts based on customer feedback on several different pages like post creation page, post preview cards etc. |
| Damla | Search Result page in web | Completed | I think the design is simple but yet it provides enough information to the user |
| Damla | Fetching language info from Wikipedia in web | Completed |I think the information we pull from Wikipedia is brief and explanatory enough|
| Damla | Survey page in web | Completed | There could have been more options for interest fields, on the other hand the options for programming languages are sufficient|
| Damla | Question post cards in web | Completed | The buttons at the bottom of the  question post cards could be more visually pleasing but it's nice that the language labels redirect to the corresponding Search Result page|
| Damla | Question details page in web | Completed |We could have added animations for upvoting/downvoting to make it look mkore user friendly |
| Damla | Design of annotations in web | Completed | I think the design matches our overall interface, so it fits well |
| Damla | Design of annotations in web | Completed | I think the design matches our overall interface, so it fits well |
| Halil | Design of annotations in mobile | Completed | Just fine. |
| Halil | Login page in mobile | Completed | Just fine. |
| Halil | Signup page in mobile | Completed | Just fine. |
| Halil | Question detail page in mobile | Completed | Just fine. |
| Halil | Feed page in mobile | Completed | Just fine. |
| Halil | Profile page in mobile | Completed | Could have shown comments. |
| Halil | Bookmark page in mobile | Completed | Just fine. |
| Halil | Top contributors page in mobile | Completed | Just fine. |
| Halil | Post creation page in mobile | Completed | Just fine. |
| Halil | Survey page in mobile | Completed | Just fine. |
| Halil | Search page in mobile | Completed | Could have added user search. |
| Halil | Syntax highlighting in mobile | Completed| Just fine. |
| Halil | Search detail page in mobile | Completed | Could have provide more info with shorter text. |
| Emin | Unittests - integrity tests of backend functions | Completed | Could have added more detailed unauthorized request tests for different functions. |

## Status of Requirements

<details>
<summary><strong> All Requirements' Statusses (Click to Expand)</strong></summary>

| Requirement ID | Description | Status |
|---------------|-------------|---------|
| **1.1.1 Post Creation Requirements** ||| 
| 1.1.1.1 | Create new posts on the forum | Completed |
| 1.1.1.2 | Attach code snippets to their posts | Completed |
| 1.1.1.3 | Specify the programming language relevant to the post | Completed |
| 1.1.1.4 | Select up to 5 predefined labels | Completed |
| 1.1.1.5 | Have the ability to format text | Completed |
| 1.1.1.6 | Include external links or media | In progress |
| 1.1.1.7 | Users shall be limited to creating 3 questions per day | Not Started |
| 1.1.1.8 | Users shall be able to edit or delete their posts | Completed |
| 1.1.1.9 | Users shall have the option to add bounty to posts | Not Started |
| **1.1.2 Feed Requirements** |||
| 1.1.2.1 | Users shall see most active posts in feed by default | In progress |
| 1.1.2.2.1 | Filter by post status (answered/unanswered) | Completed |
| 1.1.2.2.2 | Filter by programming language | Completed |
| 1.1.2.2.3 | Filter by date interval | Completed |
| 1.1.2.3 | Sort posts by creation time or popularity | Completed |
| 1.1.2.4 | Upvote and downvote posts from feed | Completed |
| **1.1.3 Forum Page Requirements** |||
| 1.1.3.1 | Dedicated forum page per programming language | Completed |
| 1.1.3.2 | Display posts with relevant language tags | Completed |
| 1.1.3.3.1 | Filters for labels, language, post status | Completed |
| 1.1.3.3.2 | Sorting by activity, popularity, creation time | In progress |
| **1.1.4 Commenting Requirements** |||
| 1.1.4.1 | Ability to comment on posts | Completed |
| 1.1.4.2 | Edit own comments | Completed |
| 1.1.4.3 | Nested comment discussions | Not Started |
| 1.1.4.4 | Deleted comments handling | Completed |
| 1.1.4.5 | Execute code snippets in comments | Completed |
| 1.1.4.6 | Share modified code snippets | Completed |
| 1.1.4.7 | Sort comments by upvotes | Completed |
| 1.1.4.8 | Delete own comments | Completed |
| **1.1.5 Code Snippet Requirements** |||
| 1.1.5.1 | Time/resource limit notifications | ??????? |
| 1.1.5.2 | Secure code execution environment | Completed (API Protection) |
| **1.1.6 Browsing Programming Languages** |||
| 1.1.6.1 | Browse Wikidata programming languages catalog | Completed |
| 1.1.6.2 | View language origin information | Not Started |
| 1.1.6.3 | Filter languages by attributes | Not Started |
| 1.1.6.4 | Search languages by name/attributes | In progress |
| 1.1.6.5 | View related programming languages | Completed |
| 1.1.6.6 | Compare languages side by side | Not Started |
| 1.1.6.9 | Access code examples/snippets | Not Started |
| **1.1.7 Question Search** |||
| 1.1.7.1 | Search questions using predefined labels | Completed (By using filter) |
| 1.1.7.2 | Filter by date, language, tags, user | In progress |
| 1.1.7.3 | Sort by relevance, date, responses | In progress |
| 1.1.7.4 | Similar question suggestions | Not Started |
| 1.1.7.5 | Save/bookmark search queries | Completed |
| 1.1.7.6 | Search within specific forums | Not Started |
| 1.1.7.7 | Search code snippets | Not Started |
| 1.1.7.8 | Search notification system | Not Started |
| 1.1.7.9 | Duplicate question prevention | Not Started |
| 1.1.7.10 | Advanced search operators | Not Started |
| 1.1.7.11 | Highlighted search terms | Not Started |
| **1.1.8 Sign Up & Login** |||
| 1.1.8.1 | Search without registration | Not Started |
| 1.1.8.2 | Sign up via website and mobile | Completed |
| 1.1.8.3 | Login/logout functionality | Completed |
| 1.1.8.4 | Email login options | Not Started |
| 1.1.8.5 | Account deletion | Completed |
| 1.1.8.6 | Logout functionality | Completed |
| **1.1.9 Profile** |||
| 1.1.9.1 | Add profile photo | Completed |
| 1.1.9.2 | Edit names | Completed |
| 1.1.9.3 | Delete account | Completed |
| 1.1.9.4 | List own posts | Completed |
| 1.1.9.5 | List own comments | Completed |
| 1.1.9.6 | List bookmarked posts | Completed |
| 1.1.9.7 | Password update with email confirmation | Completed |
| **1.2.1 Programming Languages System Requirements** |||
| 1.2.1.1 | Wikidata integration | Completed |
| 1.2.1.2 | Organized UI display | Completed |
| 1.2.1.3 | Detailed language information | Completed |
| 1.2.1.4 | Language filtering system | Not Started |
| 1.2.1.5 | Language search functionality | In Progress |
| 1.2.1.6 | Related languages display | Completed |
| 1.2.1.7 | Language comparison feature | Not Started |
| 1.2.1.8 | Language bookmarking | Not Started |
| 1.2.1.9 | Report incorrect information | Not Started |
| 1.2.1.10 | Localization support | Not Started |
| 1.2.1.11 | Accessible UI | Completed |
| 1.2.1.12 | Code examples access | Not Started |
| 1.2.1.13 | Customizable display settings | Not Started |
| 1.2.1.14 | Data consistency maintenance | In progress |
| **1.2.2 Question Search System Requirements** |||
| 1.2.2.1 | Keyword search functionality | Completed |
| 1.2.2.2 | Search filtering options | Completed |
| 1.2.2.3 | Search results display | In progress |
| **2.1 Security** |||
| 2.1.1 | User data visibility restrictions | Completed |
| 2.1.2 | Strong encryption implementation | Completed |
| 2.1.3 | Password recovery mechanism | Completed |
| 2.1.4 | Password strength tips | Completed |
| 2.1.5 | Sensitive data access control | Completed |
| 2.1.6 | HTTPS implementation | Completed |
| 2.1.7 | KVKK compliance | Completed |
| **2.2 Response** |||
| 2.2.1 | 3-second response time | In progress |
| 2.2.2 | Request limiting | Not Started |
| **2.3 Availability** |||
| 2.3.1 | Website and Android availability | Completed |
| 2.3.2 | Language character support | Completed |
| **2.4 Reliability** |||
| 2.4.1 | Continuous server operation | Completed |
| **2.5 Structure Requirements** |||
| 2.5.1.1 | Text and code execution boxes | Not Started |
| 2.5.1.2 | Question linking/grouping | Completed |
| 2.5.2.1 | Profile authored questions | Completed |
| 2.5.2.2 | Profile interaction history | Completed |
| 2.5.2.3 | Unique email requirement | Completed |
| 2.5.3.1 | Registration requirements | Completed |
| 2.5.4.1 | Login notifications | Not Started |
| 2.5.5.1 | Password complexity requirements | Completed |
    
</details>

## API Endpoints

#### API Documentation
<details>
<summary><strong> Question Endpoints (click to expand)</strong></summary>

| Endpoint | Method | URL | Description | Request Example | Response Example | Status Codes |
|----------|--------|-----|-------------|-----------------|------------------|--------------|
| Get Question Details | GET | `/get_question/{question_id}` | Retrieve details of a specific question | - | `{"question": {"id": 123, "title": "How to use async/await", "language": "JavaScript (Node.js 12.14.0)", "tags": ["async", "promises"], "details": "string", "code_snippet": "string", "upvote_count": 10, "creationDate": "2024-03-20 14:30:00", "author": "johndoe", "comments_count": 5}}` | 200: Success<br>404: Question not found |
| Get Question Comments | GET | `/question/{question_id}/comments` | Retrieve all comments for a question | - | `{"comments": [{"comment_id": 1, "details": "Try using Promise.all()", "user": "janedoe", "upvotes": 5, "code_snippet": "string", "language": "JavaScript (Node.js 12.14.0)", "creationDate": "2024-03-20 15:00:00"}]}` | 200: Success<br>404: Question not found |
| Create Question | POST | `/create_question` | Create a new question | `{"title": "Understanding async/await", "language": "JavaScript (Node.js 12.14.0)", "details": "How do I properly use async/await?", "code_snippet": "async function example() {...}", "tags": ["async", "promises"]}` and User-ID value in the Header | `{"success": "Question created successfully", "question_id": 123}` | 201: Created<br>400: Bad request<br>405: Method not allowed |
| Edit Question | PUT | `/edit_question/{question_id}` | Edit an existing question | `{"title": "Updated title", "language": "JavaScript (Node.js 12.14.0)", "details": "Updated details", "code_snippet": "string", "tags": ["updated-tag"]}` and User-ID value in the Header | `{"success": "Question edited successfully"}` | 200: Success<br>400: Bad request<br>403: Forbidden<br>404: Not found |
| Delete Question | DELETE | `/delete_question/{question_id}` | Delete a question | User-ID value in the Header | `{"success": "Question Deleted Successfully"}` | 200: Success<br>400: Bad request<br>403: Forbidden<br>404: Not found<br>500: Server error |
| Report Question | POST | `/report_question/{question_id}/report` | Report a question | User-ID value in the Header | `{"success": "Question reported successfully"}` | 200: Success<br>400: Bad request |
| Bookmark Question | POST | `/bookmark_question/{question_id}/bookmark` | Add question to user's bookmarks | User-ID value in the Header | `{"success": "Question bookmarked successfully"}` | 200: Success<br>400: Bad request<br>404: Not found |
| Remove Bookmark | DELETE | `/remove_bookmark/{question_id}/bookmark` | Remove question from bookmarks | User-ID value in the Header | `{"success": "Bookmark removed successfully"}` | 200: Success<br>400: Bad request<br>404: Not found |
| Get Filtered Questions | POST | `/get_questions_according_to_filter/{page_number}` | Get questions based on multiple filters | `{"status": "answered", "language": "JavaScript (Node.js 12.14.0)", "tags": ["async"], "startDate": "2024-01-01", "endDate": "2024-12-31"}` | `{"questions": [{"id": 123, ...}], "total_pages": 10}` | 200: Success<br>500: Server error |
| Get Search Results | GET | `/fetch_search_results_at_once/{wiki_id}/{language}/{page_number}` | Fetches and combines multiple types of search results concurrently:Wiki information for the specified ID, Questions for the given language, Annotations related to the wiki ID | User-ID value in the Header | `{"information": {...}, "questions": [...], "annotations": [...], "top_contributors": [...]}` | 200: Success<br>404: Not found<br>500: Server error |
| Get All Feed for User Results | GET | `/fetch_feed_at_once/{user_id}` | Retrieves a complete feed for a user including: Personalized questions based on user's known languages and interests, Question of the day,Top 5 contributors, Results are cached for 1 hour for performance. | - | `{"information": {...}, "questions": [...], "annotations": [...], "top_contributors": [...]}` | 200: Success<br>404: Not found<br>500: Server error |
    
</details>

<details>
<summary><strong> Annotation Endpoints (click to expand)</strong></summary>

| Endpoint | Method | URL | Description | Request Example | Response Example | Status Codes |
|----------|--------|-----|-------------|-----------------|------------------|--------------|
| Create Annotation | POST | `/create_annotation` | Create a new annotation with optional parent annotation support | ```Body :{"text": "This is an annotation","language_qid": 24582,"annotation_starting_point": 10,"annotation_ending_point": 20,"type": "annotation"}```   ```Headers :{"User-ID": 1}``` | ```json {"success": "Annotation created","annotation_id": 123,"parent_id": null}``` | 201: Created<br>400: Bad request<br>404: Not found<br>405: Method not allowed |
| Delete Annotation | DELETE | `/delete_annotation/{annotation_id}` | Delete an annotation. Only the author can delete it | ```Headers : {"User-ID": 1}``` | ```json {"success": "Annotation deleted successfully"}``` | 200: Success<br>400: Bad request<br>403: Forbidden<br>404: Not found<br>405: Method not allowed |
| Edit Annotation | PUT | `/edit_annotation/{annotation_id}` | Edit an existing annotation. Only the author can edit it | ```json {"text": "Updated annotation text","language_qid": 24582,"annotation_starting_point": 15,"annotation_ending_point": 25}``` ```Headers : {"User-ID": 1}``` | ```json {"success": "Annotation updated successfully","annotation_id": 123}``` | 200: Success<br>400: Bad request<br>403: Forbidden<br>404: Not found<br>405: Method not allowed |
| Get Annotations by Component | GET | `/get_annotations/{annotation_type}/{language_qid}` | Get all annotations for a specific language and component type | - | ```json {"success": "Annotations retrieved","data": [{"annotation_id": 123,"text": "Annotation text","annotation_type": "question","language_qid": 24582,"annotation_starting_point": 10,"annotation_ending_point": 20,"annotation_date": "2024-01-01T12:00:00Z","author_id": 456,"author_name": "username","parent_id": null,"child_annotations": []}]}``` | 200: Success<br>400: Bad request<br>404: Not found<br>405: Method not allowed |
| Get All Annotations | GET | `/annotations/all` | Get all annotations in the system | - | ```json {"success": "Annotations retrieved","data": [{"annotation_id": 123,"text": "Annotation text","language_qid": 24582,"annotation_starting_point": 10,"annotation_ending_point": 20,"annotation_date": "2024-01-01T12:00:00Z","author_id": 456,"author_name": "username","parent_id": null,"child_annotations": []}]}``` | 200: Success<br>400: Bad request<br>404: Not found<br>405: Method not allowed |
    
</details>


<details>
<summary><strong> User Endpoints (click to expand)</strong></summary>

| Endpoint | Method | URL | Description | Request Example | Response Example | Status Codes |
|----------|--------|-----|-------------|-----------------|------------------|--------------|
| User Signup | POST | `/signup` | Create a new user account | ```json {"username": "johndoe","email": "john@example.com","password1": "securepass123","password2": "securepass123"}``` | ```json {"success": "User created and logged in successfully","user_id": 123,"username": "johndoe","token": "eyJ0eXA..."}``` | 201: Created 400: Bad request 405: Method not allowed 500: Server error |
| User Login | POST | `/login` | Authenticate user and get access token | ```json {"username": "johndoe","password": "securepass123"}``` | ```json {"status": "success","user_id": 123,"token": "eyJ0eXA...","user_type": "USER"}``` | 200: Success 400: Bad request 405: Method not allowed |
| User Logout | POST | `/logout` | Logout user and invalidate token | ```json {"token": "eyJ0eXA..."}``` | ```json {"status": "success","message": "User logged out successfully"}``` | 200: Success 400: Bad request |
| Get User Profile | GET | `/get_user_profile_by_username/{username}` | Get user profile details | - | ```json {"user": {"username": "johndoe","email": "john@example.com","questions": [],"comments": [],"bookmarks": [],"annotations": [],"profile_pic": null,"bio": "About me","interested_topics": ["python","javascript"],"known_languages": ["python","java"],"name": "John","surname": "Doe","user_id": 123}}``` | 200: Success 400: Bad request 404: Not found |
| Edit User Profile | PUT | `/edit_user_profile/{user_id}` | Edit user profile details | Headers: ```User-ID: 123```<br><br>Body: ```json {"username": "newusername","email": "newemail@example.com","bio": "Updated bio","profile_pic": "pic_url"}``` | ```json {"success": "User profile updated successfully"}``` | 200: Success 400: Bad request 403: Forbidden 404: Not found |
| Request Password Reset | POST | `/reset_password` | Request password reset email | ```json {"email": "john@example.com"}``` | ```json {"message": "Password reset link sent to your email."}``` | 200: Success 400: Bad request 404: Not found |
| Reset Password | POST | `/reset_password/{uidb64}/{token}` | Reset user password with token | ```json {"new_password": "newpass123","confirm_password": "newpass123"}``` | ```json {"message": "Password has been reset successfully."}``` | 200: Success 400: Bad request |
| Upload Profile Picture | POST | `/upload-profile-pic` | Upload user profile picture | Headers: ```User-ID: 123``` Files: ```profile_pic: URL``` | ```json {"success": "Profile picture uploaded successfully","url": "/media/profiles/pic.jpg"}``` | 200: Success 400: Bad request 405: Method not allowed |

</details>



<details>
<summary><strong> Comment Endpoints (click to expand)</strong></summary>
    
| Endpoint | Method | URL | Description | Request Example | Response Example | Status Codes |
|----------|--------|-----|-------------|-----------------|------------------|--------------|
| Create Comment | POST | `/create_comment/{question_id}` | Create a new comment for a specific question | Headers: ```User-ID: 123```<br><br>Body: ```json {"details": "This is a comment","code_snippet": "print('Hello')", "language": "Python (3.12.5)"}``` | ```json {"success": "Comment created successfully","comment_id": 456}``` | 201: Created 400: Bad request 404: Not found 405: Method not allowed |
| Edit Comment | PUT | `/edit_comment/{comment_id}` | Edit an existing comment (owner or admin only) | Headers: ```User-ID: 123```<br><br>Body: ```json {"details": "Updated comment text","code_snippet": "updated code","language_id": 1}``` | ```json {"success": "Comment edited successfully"}``` | 200: Success 400: Bad request 403: Forbidden 404: Not found |
| Delete Comment | DELETE | `/delete_comment/{comment_id}` | Delete a comment (owner or admin only) | Headers: ```User-ID: 123``` | ```json {"success": "Comment Deleted Successfully"}``` | 200: Success 400: Bad request 403: Forbidden 404: Not found 500: Server error |
| Mark as Answer | POST | `/mark_comment_as_answer/{comment_id}` | Mark a comment as the answer to its question (question owner or admin only) | Headers: ```User-ID: 123``` | ```json {"success": "Comment 456 marked as the answer for question 123"}``` | 200: Success 400: Bad request 403: Forbidden 404: Not found 500: Server error |
| Unmark as Answer | POST | `/unmark_comment_as_answer/{comment_id}` | Remove a comment's answer status (question owner or admin only) | Headers: ```User-ID: 123``` | ```json {"success": "Comment 456 unmarked as the answer for question 123"}``` | 200: Success 400: Bad request 403: Forbidden 404: Not found 500: Server error |


</details>




<details>
<summary><strong> Utilization Endpoints (click to expand)</strong></summary>
    
| Endpoint | Method | URL | Description | Request Example | Response Example | Status Codes |
|----------|--------|-----|-------------|-----------------|------------------|--------------|
| Search Languages | GET | `/search/{search_strings}` | Search for programming languages on Wikidata | URL:```/search/javascript``` | ```json {"head": {"vars": ["language", "languageLabel"]},"results": {"bindings": [{"language": {"type": "uri","value": "http://www.wikidata.org/entity/Q2005"},"languageLabel": {"xml:lang": "en","type": "literal","value": "JavaScript"}},{"language": {"type": "uri","value": "http://www.wikidata.org/entity/Q2298909"},"languageLabel": {"xml:lang": "en","type": "literal","value": "Unobtrusive JavaScript"}}]}}``` | 200: Success 500: Server error |
| Get Language Details | GET | `/result/{wiki_id}` | Get comprehensive details about a language | URL:```/result/Q2005```  | ```json {"mainInfo": [{"language": {"value": "http://www.wikidata.org/entity/Q2005"},"languageLabel": {"value": "JavaScript"},"website": {"value": "https://www.ecma-international.org/publications-and-standards/standards/ecma-262/"},"wikipediaLink": {"value": "https://en.wikipedia.org/wiki/JavaScript"}}],"instances": [{"instance": "scripting language","instanceLabel": "scripting language","relatedLanguages": [{"relatedLanguage": "AppleScript","relatedLanguageLabel": "AppleScript"}]}],"wikipedia": {"title": "JavaScript","info": "JavaScript is a programming language and core technology of the Web"}}``` | 200: Success 500: Server error |
| Get Available Languages | GET | `/get_api_languages` | Get list of supported programming languages | - | ```json {"languages": {"Assembly (NASM 2.14.02)": 45,"Bash (5.0.0)": 46, ... "R (4.4.1)": 99, ... "TypeScript (5.6.2)": 101}}``` | 200: Success 500: Server error |
| Run Code | POST | `/run_code/{type}/{id}` | Execute code from a question or comment | Headers: ```User-ID: 123``` URL:```/run_code/question/1``` | ```json {"output": "Hello World!"}``` | 200: Success 400: Bad request 404: Not found |
| Upvote Object | GET | `/upvote_object/{object_type}/{object_id}` | Upvote a question or comment. Returns upvote count. | Headers: ```User-ID: 123``` URL:```/upvote_object/question/1``` | ```json {"success": 42}``` | 200: Success 400: Bad request 404: Not found |
| Downvote Object | GET | `/downvote_object/{object_type}/{object_id}` | Downvote a question or comment. Returns upvote count. | Headers: ```User-ID: 123``` URL:```/downvote_object/comment/3``` | ```json {"success": 6}``` | 200: Success 400: Bad request 404: Not found |


</details>

#### Common Response Codes
| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 403 | Insufficient permissions |
| 404 | Not Found |
| 405 | Invalid request type |
| 500 | Internal Server Error |




### Base URL
https://clownfish-app-brdp5.ondigitalocean.app/


### 3 Examples

<details>
<summary><strong> 1 - Get Filtered Questions </strong></summary>
    
**Endpoint:** `POST /get_questions_according_to_filter/{page_number}`

**Description:** Retrieves questions based on specified filter criteria. All filter parameters are optional.

**Authentication Required:** Yes
- Header: `User-ID: {user_id}`

**Request Body:**
```json
{
    'status': 'unanswered', // Options: "answered", "unanswered", "discussion", "all"
    'language': 'all',  // Any programming language or "all"
    'tags': ['Python'], 
    'date_range': 
    {
        'start_date': '2024-12-01', // Format: YYYY-MM-DD
        'end_date': '2024-12-27' // Format: YYYY-MM-DD
    }
}
```

**Example Response (200 OK):**
```json
{
    "questions": [
        {
            "id": 18,
            "title": "Why is my Python script hanging when reading large files?",
            "description": "I have a Python script that reads a large file line by line, but it seems to hang. What is the best way to efficiently process large files without consuming too much memory?",
            "user_id": 16,
            "username": "mert22",
            "upvotes": 0,
            "comments_count": 0,
            "programmingLanguage": "Python (2.7.17)",
            "codeSnippet": "with open('large_file.txt', 'r') as file:\n    for line in file:\n        process(line)\n",
            "tags": [
                "Python"
            ],
            "answered": false,
            "is_upvoted": false,
            "is_downvoted": false,
            "is_bookmarked": false,
            "created_at": "2024-12-17 08:24:27",
            "post_type": "question"
        },
        {
            "id": 1,
            "title": "How to reverse a string in Python?",
            "description": "I'm trying to find the most efficient way to reverse a string in Python. Can someone help me understand the different approaches?",
            "user_id": 1,
            "username": "mutti",
            "upvotes": 1,
            "comments_count": 4,
            "programmingLanguage": "Python (3.8.1)",
            "codeSnippet": "text = 'Hello World'\n# What's the best way to reverse this?",
            "tags": [
                "Python",
                "Algorithms"
            ],
            "answered": false,
            "is_upvoted": false,
            "is_downvoted": false,
            "is_bookmarked": false,
            "created_at": "2024-12-12 15:22:08",
            "post_type": "question"
        }
    ],
    "total_pages": 1
}
```

**Error Response (400 Bad Request):**
```json
{
    "error": "Invalid date format for startDate"
}
```

**Error Response (500 Internal Server Error):**
```json
{
    "error": "Internal server error message"
}
```

**Filters:**
- `status`: Filter by question status
- `language`: Filter by programming language
- `tags`: Filter by multiple tags (case-insensitive)
- `startDate`: Filter questions on or after this date
- `endDate`: Filter questions on or before this date
    </details>

 
    <details>
    <summary><strong> 2 - Fetch Combined Search Results </strong></summary>
    
**Endpoint:** `GET /fetch_search_results_at_once/{wiki_id}/{language}/{page_number}`

**Description:** Fetches and combines multiple types of search results concurrently, including wiki information, questions, annotations, top contributors, and popular tags.

**Authentication Required:** Optional
- Header: `User-ID: {user_id}` (enhances results with user-specific data)

**URL Parameters:**
- `wiki_id` (required): Wiki identifier for the search
- `language` (required): Programming language to filter questions
- `page_number` (optional): Page number for paginated results (default: 1)

**Example Request:**
```
GET /fetch_search_results_at_once/Q2005/javascript/1
```

**Example Response (200 OK):**
```json
{
    "information": {
        "mainInfo": [
            {
                "language": {
                    "type": "uri",
                    "value": "http://www.wikidata.org/entity/Q2005"
                },
                "languageLabel": {
                    "xml:lang": "en",
                    "type": "literal",
                    "value": "JavaScript"
                },
                "publicationDate": {
                    "datatype": "http://www.w3.org/2001/XMLSchema#dateTime",
                    "type": "literal",
                    "value": "1995-09-01T00:00:00Z"
                },
                "inceptionDate": {
                    "datatype": "http://www.w3.org/2001/XMLSchema#dateTime",
                    "type": "literal",
                    "value": "1996-05-01T00:00:00Z"
                },
                "website": {
                    "type": "uri",
                    "value": "https://www.ecma-international.org/publications-and-standards/standards/ecma-262/"
                },
                "wikipediaLink": {
                    "type": "uri",
                    "value": "https://en.wikipedia.org/wiki/JavaScript"
                },
                "influencedByLabel": {
                    "xml:lang": "en",
                    "type": "literal",
                    "value": "Java"
                }
            }
        ],
        "instances": [
            {
                "instance": "http://www.wikidata.org/entity/Q187432",
                "instanceLabel": "scripting language",
                "relatedLanguages": [
                    {
                        "relatedLanguage": "http://www.wikidata.org/entity/Q129137",
                        "relatedLanguageLabel": "AppleScript"
                    },
                    {
                        "relatedLanguage": "http://www.wikidata.org/entity/Q204222",
                        "relatedLanguageLabel": "KornShell"
                    },
                    {
                        "relatedLanguage": "http://www.wikidata.org/entity/Q213970",
                        "relatedLanguageLabel": "AWK"
                    }
                ]
            },
            {
                "instance": "http://www.wikidata.org/entity/Q211496",
                "instanceLabel": "high-level programming language",
                "relatedLanguages": [
                    {
                        "relatedLanguage": "http://www.wikidata.org/entity/Q176984",
                        "relatedLanguageLabel": "UCSD Pascal"
                    },
                    {
                        "relatedLanguage": "http://www.wikidata.org/entity/Q380523",
                        "relatedLanguageLabel": "ABAP"
                    },
                    {
                        "relatedLanguage": "http://www.wikidata.org/entity/Q978185",
                        "relatedLanguageLabel": "TypeScript"
                    }
                ]
            },
            {
                "instance": "http://www.wikidata.org/entity/Q241317",
                "instanceLabel": "computing platform",
                "relatedLanguages": [
                    {
                        "relatedLanguage": "http://www.wikidata.org/entity/Q109996742",
                        "relatedLanguageLabel": "USRP B210"
                    },
                    {
                        "relatedLanguage": "http://www.wikidata.org/entity/Q109997567",
                        "relatedLanguageLabel": "Cube Orange Standard Set"
                    },
                    {
                        "relatedLanguage": "http://www.wikidata.org/entity/Q110532512",
                        "relatedLanguageLabel": "Österreich forscht"
                    }
                ]
            }
        ],
        "wikipedia": {
            "title": "JavaScript",
            "info": "JavaScript (), often abbreviated as JS, is a programming language and core technology of the Web, alongside HTML and CSS. 99% of websites use JavaScript on the client side for webpage behavior.\nWeb browsers have a dedicated JavaScript engine that executes the client code. These engines are also utilized in some servers and a variety of apps. The most popular runtime system for non-browser usage is Node.js.\nJavaScript is a high-level, often just-in-time compiled language that conforms to the ECMAScript standard. It has dynamic typing, prototype-based object-orientation, and first-class functions. It is multi-paradigm, supporting event-driven, functional, and imperative programming styles. It has application programming interfaces (APIs) for working with text, dates, regular expressions, standard data structures, and the Document Object Model (DOM)."
        }
    },
    "questions": [
        {
            "id": 7,
            "title": "Why is my JavaScript fetch API call returning a 404?",
            "description": "I am sure the URL is correct. What could be causing the 404?\n\n",
            "user_id": 5,
            "username": "kroston",
            "upvotes": -1,
            "comments_count": 0,
            "programmingLanguage": "JavaScript (Node.js 12.14.0)",
            "codeSnippet": "fetch('https://api.example.com/data', {\n    method: 'POST',\n    body: JSON.stringify({ key: 'value' }),\n    headers: {\n        'Content-Type': 'application/json',\n    }\n})\n    .then(response => response.json())\n    .then(data => console.log(data))\n    .catch(error => console.error('Error:', error));\n",
            "tags": [
                "JavaScript"
            ],
            "answered": false,
            "is_upvoted": false,
            "is_downvoted": true,
            "is_bookmarked": false,
            "created_at": "2024-12-16 15:44:57",
            "post_type": "question"
        }
    ],
    "page_count": 1,
    "annotations": [],
    "top_contributors": [
        {
            "username": "mutti",
            "email": "a",
            "name": null,
            "surname": null,
            "contribution_points": 105
        },
        {
            "username": "fatih",
            "email": "fatih@gmail.com",
            "name": null,
            "surname": null,
            "contribution_points": 12
        },
        {
            "username": "kroston",
            "email": "kroston@gmail.com",
            "name": null,
            "surname": null,
            "contribution_points": 9
        },
        {
            "username": "melissa",
            "email": "melissa123@gmail.com",
            "name": null,
            "surname": null,
            "contribution_points": 4
        },
        {
            "username": "mert22",
            "email": "mert22@gmail.com",
            "name": null,
            "surname": null,
            "contribution_points": 4
        }
    ],
    "top_tags": [
        "CUDA",
        "Python",
        "JavaScript",
        "Algorithms",
        "C"
    ]
}
```

**Error Response (404 Not Found):**
```json
{
    "error": "Wiki ID Q2005 not found"
}
```

**Error Response (500 Internal Server Error):**
```json
{
    "error": "Error fetching concurrent results"
}
```
</details>
    

<details>
<summary><strong> 3 - Fetch All User Feed </strong></summary>
    
**Endpoint:** `GET /fetch_feed_at_once/{user_id}`

**Description:** Retrieves a complete personalized feed for a user including personalized questions, question of the day, top contributors, and popular tags. Results are cached for 1 hour for performance.

**Authentication Required:** Yes
- Header: `User-ID: {user_id}`

**URL Parameters:**
- `user_id` (required): ID of the user to fetch feed for

**Example Request:**
```
GET /fetch_feed_at_once/1/
```

**Example Response (200 OK):**
```json
{
    "personalized_questions": [
        {
            "id": 6,
            "title": "How do efficiently multithread in python?",
            "description": "I am beginner in python. I want to implement a multiqueue system which handles different type of jobs in different queues asyncronously. I am planning to use multithreading for optimization.",
            "user_id": 9,
            "username": "fatih",
            "upvotes": 2,
            "comments_count": 1,
            "programmingLanguage": "Python (3.12.5)",
            "codeSnippet": "print(\"thread\")",
            "tags": [
                "Time Complexity",
                "Performance Optimization"
            ],
            "answered": true,
            "is_upvoted": true,
            "is_downvoted": false,
            "is_bookmarked": false,
            "created_at": "2024-12-16 14:22:53",
            "post_type": "question"
        },
        {
            "id": 21,
            "title": "Advantages and disadvantages of using RUST?",
            "description": "I have been hearing so much about the rust from the gurus I am trying to wrapped my mind around what type of applications are they ısed for what are the main advatnages of using rust specifid experiences would be appreciated.",
            "user_id": 1,
            "username": "mutti",
            "upvotes": 0,
            "comments_count": 3,
            "programmingLanguage": "",
            "codeSnippet": "",
            "tags": [
                "Rust"
            ],
            "answered": false,
            "is_upvoted": false,
            "is_downvoted": false,
            "is_bookmarked": false,
            "created_at": "2024-12-17 09:20:10",
            "post_type": "discussion"
        },
        {
            "id": 20,
            "title": "Understanding CUDA Thread Warping, why 32?",
            "description": "In CUDA programming, a warp is the fundamental unit of thread execution on NVIDIA GPUs, consisting of 32 threads. Here are key points to understand about thread warping and its significance:\n\nWhy 32 Threads?\n\nNVIDIA GPUs are designed with a SIMD (Single Instruction, Multiple Data) architecture. A warp of 32 threads allows efficient parallel execution while balancing hardware complexity and throughput.\nModern GPUs execute warps in lockstep, meaning all 32 threads execute the same instruction simultaneously but on different data.",
            "user_id": 1,
            "username": "mutti",
            "upvotes": 0,
            "comments_count": 0,
            "programmingLanguage": "",
            "codeSnippet": "",
            "tags": [
                "CUDA"
            ],
            "answered": false,
            "is_upvoted": false,
            "is_downvoted": false,
            "is_bookmarked": false,
            "created_at": "2024-12-17 08:38:51",
            "post_type": "discussion"
        },
        {
            "id": 19,
            "title": "How do you implement retries with exponential backoff in a Node.js app?",
            "description": "I need to implement retries with an exponential backoff for an API call in my Node.js app. How should I structure the logic?",
            "user_id": 16,
            "username": "mert22",
            "upvotes": 0,
            "comments_count": 0,
            "programmingLanguage": "",
            "codeSnippet": "",
            "tags": [
                "JavaScript"
            ],
            "answered": false,
            "is_upvoted": false,
            "is_downvoted": false,
            "is_bookmarked": false,
            "created_at": "2024-12-17 08:27:19",
            "post_type": "discussion"
        },
        {
            "id": 18,
            "title": "Why is my Python script hanging when reading large files?",
            "description": "I have a Python script that reads a large file line by line, but it seems to hang. What is the best way to efficiently process large files without consuming too much memory?",
            "user_id": 16,
            "username": "mert22",
            "upvotes": 0,
            "comments_count": 0,
            "programmingLanguage": "Python (2.7.17)",
            "codeSnippet": "with open('large_file.txt', 'r') as file:\n    for line in file:\n        process(line)\n",
            "tags": [
                "Python"
            ],
            "answered": false,
            "is_upvoted": false,
            "is_downvoted": false,
            "is_bookmarked": false,
            "created_at": "2024-12-17 08:24:27",
            "post_type": "question"
        },
        {
            "id": 17,
            "title": "What is recursion",
            "description": "I am CMPE150 student in Bogazici University. The teacher explained something like recursion. I love for loops but it is so ridiculous. Why would someone use that?",
            "user_id": 1,
            "username": "mutti",
            "upvotes": 1,
            "comments_count": 0,
            "programmingLanguage": "",
            "codeSnippet": "",
            "tags": [
                "Recursion"
            ],
            "answered": false,
            "is_upvoted": false,
            "is_downvoted": false,
            "is_bookmarked": false,
            "created_at": "2024-12-16 16:40:23",
            "post_type": "discussion"
        },
        {
            "id": 16,
            "title": "How to improve memory access patterns in CUDA",
            "description": "This is too slow",
            "user_id": 1,
            "username": "mutti",
            "upvotes": 0,
            "comments_count": 0,
            "programmingLanguage": "C++ (Clang 7.0.1)",
            "codeSnippet": "__global__ void process2DArray(float* d_array, int width, int height) {\n    int x = blockIdx.x * blockDim.x + threadIdx.x;\n    int y = blockIdx.y * blockDim.y + threadIdx.y;\n\n    if (x < width && y < height) {\n        int index = y * width + x; // Row-major memory access\n        d_array[index] *= 2.0f;    // Example operation\n    }\n}\n\n// Kernel launch\ndim3 threadsPerBlock(16, 16);\ndim3 numBlocks((width + threadsPerBlock.x - 1) / threadsPerBlock.x,\n               (height + threadsPerBlock.y - 1) / threadsPerBlock.y);\nprocess2DArray<<<numBlocks, threadsPerBlock>>>(d_array, width, height);\n",
            "tags": [
                "CUDA"
            ],
            "answered": false,
            "is_upvoted": false,
            "is_downvoted": false,
            "is_bookmarked": false,
            "created_at": "2024-12-16 16:06:26",
            "post_type": "question"
        },
        {
            "id": 15,
            "title": "How can I debounce a function in TypeScript? ",
            "description": "This is my first code in TypeScript, please take a look and let me know how I can fix it.",
            "user_id": 12,
            "username": "john1232",
            "upvotes": 0,
            "comments_count": 0,
            "programmingLanguage": "TypeScript (3.7.4)",
            "codeSnippet": "function debounce(func: Function, delay: number) {\n    let timer: NodeJS.Timeout;\n    return function (...args: any[]) {\n        clearTimeout(timer);\n        timer = setTimeout(() => func(...args), delay);\n    };\n}\n\nconst handleResize = debounce(() => {\n    console.log('Resized');\n}, 500);\n\nwindow.addEventListener('resize', handleResize);\n",
            "tags": [
                "TypeScript"
            ],
            "answered": false,
            "is_upvoted": false,
            "is_downvoted": false,
            "is_bookmarked": false,
            "created_at": "2024-12-16 16:04:46",
            "post_type": "question"
        },
        {
            "id": 13,
            "title": "What are the pros and cons of using microservices architecture over a monolithic architecture?",
            "description": "Microservices have gained significant popularity in recent years, but monolithic applications still have their advantages. In what scenarios would you choose one over the other? How do factors like team size, deployment complexity, scalability, and maintainability influence this decision? What are some of the challenges you’ve faced while implementing microservices or maintaining a monolith?\n\n",
            "user_id": 12,
            "username": "john1232",
            "upvotes": 1,
            "comments_count": 0,
            "programmingLanguage": "",
            "codeSnippet": "",
            "tags": [
                "Monolithic Architecture",
                "Microservices"
            ],
            "answered": false,
            "is_upvoted": false,
            "is_downvoted": false,
            "is_bookmarked": false,
            "created_at": "2024-12-16 15:56:35",
            "post_type": "discussion"
        },
        {
            "id": 11,
            "title": "Debugging Strategies",
            "description": "When working on a large codebase with limited documentation, what strategies and tools do you use to debug effectively? How do you identify the root cause of an issue, and how do you prioritize which parts of the system to examine first? Can you share any specific techniques or examples from your experience?",
            "user_id": 11,
            "username": "melissa",
            "upvotes": 0,
            "comments_count": 0,
            "programmingLanguage": "",
            "codeSnippet": "",
            "tags": [
                "Debugging Tools",
                "Debugging"
            ],
            "answered": false,
            "is_upvoted": false,
            "is_downvoted": false,
            "is_bookmarked": false,
            "created_at": "2024-12-16 15:52:46",
            "post_type": "discussion"
        }
    ],
    "question_of_the_day": {
        "id": 11,
        "title": "Debugging Strategies",
        "description": "When working on a large codebase with limited documentation, what strategies and tools do you use to debug effectively? How do you identify the root cause of an issue, and how do you prioritize which parts of the system to examine first? Can you share any specific techniques or examples from your experience?",
        "user_id": 11,
        "upvotes": 0,
        "username": "melissa",
        "comments_count": 0,
        "programmingLanguage": "",
        "codeSnippet": "",
        "tags": [
            "Debugging Tools",
            "Debugging"
        ],
        "answered": false
    },
    "top_contributors": [
        {
            "username": "mutti",
            "email": "a",
            "name": null,
            "surname": null,
            "contribution_points": 105
        },
        {
            "username": "fatih",
            "email": "fatih@gmail.com",
            "name": null,
            "surname": null,
            "contribution_points": 12
        },
        {
            "username": "kroston",
            "email": "kroston@gmail.com",
            "name": null,
            "surname": null,
            "contribution_points": 9
        },
        {
            "username": "melissa",
            "email": "melissa123@gmail.com",
            "name": null,
            "surname": null,
            "contribution_points": 4
        },
        {
            "username": "mert22",
            "email": "mert22@gmail.com",
            "name": null,
            "surname": null,
            "contribution_points": 4
        }
    ],
    "top_tags": [
        "CUDA",
        "Python",
        "JavaScript",
        "Algorithms",
        "C"
    ],
    "page_count": 2
}
```

**Error Response (404 Not Found):**
```json
{
    "error": "User not found"
}
```

</details>
    
    

<details>
<summary><strong> Postman Collection of Requests (click to expand)</strong></summary> 
    
```json!
{
	"info": {
		"_postman_id": "710b3f70-991c-41f2-b51d-9a389e038fec",
		"name": "CMPE451-API-DOC",
		"schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
		"_exporter_id": "26186861"
	},
	"item": [
		{
			"name": "GET fetch_feed_at_once",
			"request": {
				"method": "GET",
				"header": [],
				"url": {
					"raw": "https://clownfish-app-brdp5.ondigitalocean.app/fetch_feed_at_once/1/",
					"protocol": "https",
					"host": [
						"clownfish-app-brdp5",
						"ondigitalocean",
						"app"
					],
					"path": [
						"fetch_feed_at_once",
						"1",
						""
					]
				}
			},
			"response": []
		},
		{
			"name": "GET fetch_search_results_at_once",
			"protocolProfileBehavior": {
				"disableBodyPruning": true
			},
			"request": {
				"method": "GET",
				"header": [
					{
						"key": "User-ID",
						"value": "1",
						"type": "text"
					}
				],
				"body": {
					"mode": "file",
					"file": {}
				},
				"url": {
					"raw": "https://clownfish-app-brdp5.ondigitalocean.app/fetch_search_results_at_once/Q2005/javascript/1",
					"protocol": "https",
					"host": [
						"clownfish-app-brdp5",
						"ondigitalocean",
						"app"
					],
					"path": [
						"fetch_search_results_at_once",
						"Q2005",
						"javascript",
						"1"
					]
				}
			},
			"response": []
		},
		{
			"name": "POST get_questions_according_to_the_filter",
			"request": {
				"method": "POST",
				"header": [
					{
						"key": "User-ID",
						"value": "1",
						"type": "text"
					}
				],
				"body": {
					"mode": "raw",
					"raw": "{\r\n    \"status\": \"unanswered\", \r\n    \"language\": \"all\",  \r\n    \"tags\": [\"Python\"], \r\n    \"date_range\": \r\n    {\r\n        \"start_date\": \"2024-12-01\", \r\n        \"end_date\": \"2024-12-27\" \r\n    }\r\n}",
					"options": {
						"raw": {
							"language": "json"
						}
					}
				},
				"url": {
					"raw": "https://clownfish-app-brdp5.ondigitalocean.app/get_questions_according_to_filter/1",
					"protocol": "https",
					"host": [
						"clownfish-app-brdp5",
						"ondigitalocean",
						"app"
					],
					"path": [
						"get_questions_according_to_filter",
						"1"
					]
				}
			},
			"response": []
		}
	]
}
```
</details>


## User Interface / User Experience

- The commits and PR links from [Lab 6](https://github.com/bounswe/bounswe2024group9/wiki/Lab-Report-%236) were directly affecting the user experience by adding a survey to personalize the feed and question creation (by showing the chosen topics/languages at the top) and by showing the question of the day on the feed.
 
- To enhance the user experience, a few PR's were dedicated to speed up the page loading processes such as [#292](https://github.com/bounswe/bounswe2024group9/issues/292)

- Mobile UI:


## Standards
Our team successfully implemented W3C standards by integrating annotations into both our web and mobile applications. We created an Annotation model in the database, both web and mobile apps use this class to create, edit and delete annotations on selected content. This ensures a standardized approach to storing and sharing annotation data, aligning with W3C’s specifications.  
Users can highlight any text on Search Results page and Question Details page, including language information, question text, answers and code snippets. Users can also view other people’s annotations without the ability to edit or delete them. 
By adhering to W3C standards, we have ensured interoperability, consistency, and scalability for our annotation features across platforms, enhancing collaboration and information accessibility for our users.
## Scenarios
    
Ahmet is a freshman computer engineering student. He is truly a computer science enthusiast, so he would be excited to learn more about his field of interest and share experiences.

Firstly, he signs up to Koduyorum through the web page. He enters a unique username ahmet123, his email ahmet123@gmail.com, and his password Ahmet1234. After clicking on sign up, he is redirected to a survey asking his topics of interest and known languages. He chooses C++ and Java. Then, he is redirected to the login page where he enters his username and password. 

Once he successfully logs in, he is redirected to the feed page. He sees many different questions and discussions which catch his interest, especially the question of the day at the top of the feed talking about CUDA. However, he doesn't know what CUDA is so he searches for it in the bar at the top of the page. 

Once he is redirected to the Wikidata Search Results page, he reads about CUDA's details and annotations other computer science enthusiasts have left. He decides to open a discussion on the benefits of learning CUDA. At the feed page, he clicks on the plus sign opening a prompt. He writes "Python simulation Vc CUDA?" in the title and "I am a beginner in this field and have just come across CUDA, I see that it is a parallel processing platform but do not understand what benefits it has compared to some libraries in python simulating the same behavior. Why would I use it and why should I learn it?". He also leaves a code snippet of python simulating parallel programming, and leaves an annotation at the imported library. 

Finally, he searches for other CUDA questions and bookmarks them so he could access them easily through his profile. He also learns that all of these functions are available on a mobile app as well so he can use it on the go! Ahmet is a very happy first-time user and eagerly awaits answers and comments related to CUDA.

# Individual Documentation

<details>
<summary><strong>Kristina Trajkovski</strong></summary>
    
### General Information
    
* Group 9

* Subgroup: back end (Wikidata info, searching, results), web front end (Wikidata display, annotations at search results), management (planning, report)
* Responsibilities: 
    * back end: Wikidata info, Wiki data searching, Wikidata results retrieval
    * web front end: Wikidata search results display-wikidata linking, web annotations
    * management - long-term plan, report
### Main Contributions
    
- The logic for wikidata searching and result display
- Annotations in the web logic and display
- Long term plan and management
### Code Related Significant issues
- [Code Related Significant Issues from Milestone 1](https://github.com/bounswe/bounswe2024group9/blob/main/reports/m1_group9.md#:~:text=%2C%20PR%20%23223-,Code%2Drelated%20significant%20issues,-%3A%20%2D%2D%20One%20of%20the)
- [Code Related Significant Issues from Milestone 2](https://github.com/bounswe/bounswe2024group9/blob/main/reports/m2_group9.md#code-related-significant-issues)
- [#327](https://github.com/bounswe/bounswe2024group9/issues/327)
### Management Related Significant Issues
- [Management Related Significant Issues from Milestone 1](https://github.com/bounswe/bounswe2024group9/blob/main/reports/m1_group9.md#:~:text=Non%2Dcode%2Drelated-,significant%20issues%3A,-%2D%2D%20There%20were%20missed)
- [Management Related Significant Issues from Milestone 2](https://github.com/bounswe/bounswe2024group9/blob/main/reports/m2_group9.md#management-related-significant-issues)
- Updated the [long term plan](https://github.com/bounswe/bounswe2024group9/wiki/Long%E2%80%90term-planning-451) according to Milestone 2 feedback
### Pull Requests 
- Previous Milestones
    
- [#213 - reviewer](https://github.com/bounswe/bounswe2024group9/pull/213)
- [#221 - reviewer](https://github.com/bounswe/bounswe2024group9/pull/221)
- [#223](https://github.com/bounswe/bounswe2024group9/pull/223)
- [#252 - reviewer](https://github.com/bounswe/bounswe2024group9/pull/252)
 - [#257](https://github.com/bounswe/bounswe2024group9/pull/257)
 - [#280](https://github.com/bounswe/bounswe2024group9/pull/280)
 - [#293](https://github.com/bounswe/bounswe2024group9/pull/293)
 - [#302 - reviewer](https://github.com/bounswe/bounswe2024group9/issues/302)
 - [#306](https://github.com/bounswe/bounswe2024group9/pull/306)
 - [#307 - reviewer](https://github.com/bounswe/bounswe2024group9/pull/307)
- Final Milestone
 - [#344](https://github.com/bounswe/bounswe2024group9/pull/344)
 - [#348 - reviewed](https://github.com/bounswe/bounswe2024group9/pull/348) 
 - [#355 - reviewed](https://github.com/bounswe/bounswe2024group9/pull/355)

### Tests
 - Unit Tests
        - [Search Results Web Front End](https://github.com/bounswe/bounswe2024group9/pull/293/commits/5b3d3d413546e79af604b95e3516f21874c8250f)
    - [Search Results Back End](https://github.com/bounswe/bounswe2024group9/pull/280/commits/e9e120d2a094c3dd1a4ab44045e2da3e587abc10)
 - [Integration Test](https://github.com/bounswe/bounswe2024group9/pull/306/commits/447e578f046a3085e6375216475d5573a097610f)
 - [User Test for Web Annotations](https://github.com/bounswe/bounswe2024group9/wiki/451-%E2%80%90-Testing#11-annotation-functionality)
### Additional Information: although many times overlooked, a lot of my time during the semester was spent on management, communication, reviewing, wiki page additions, and reports.

</details>

<details>
<summary><strong>Serhan Çakmak</strong></summary>
    
### General Information
    
* Group 9
    * Subgroup: back end , web front end
* Responsibilities: 
    * back end: code execution, authorization, annotations ,bookmark, unit testing for question and utilities
    * web front end: question page, profile page's comment section
### Main Contributions
    -Establishing connection between back end and front end, especially in the question page
    -Code execution
    -Authorization 
    -Enhanced annotations in the backend and implemented in the question page
    -Unit testing for backend functions
    
### Code Related Significant issues
- [Code Related Significant Issues from Milestone 1](https://github.com/bounswe/bounswe2024group9/blob/main/reports/m1_group9.md#serhan-%C3%A7akmak)
- [Code Related Significant Issues from Milestone 2](https://github.com/bounswe/bounswe2024group9/blob/main/reports/m2_group9.md#code-related-significant-issues-1)
- [#332](https://github.com/bounswe/bounswe2024group9/issues/332)
- [#346](https://github.com/bounswe/bounswe2024group9/issues/346)
- [#352](https://github.com/bounswe/bounswe2024group9/issues/352)

### Pull Requests 
- [#236 ](https://github.com/bounswe/bounswe2024group9/pull/236)
- [#223](https://github.com/bounswe/bounswe2024group9/pull/223)
- [#210](https://github.com/bounswe/bounswe2024group9/pull/210)
 - [#252](https://github.com/bounswe/bounswe2024group9/pull/252)
 - [#255](https://github.com/bounswe/bounswe2024group9/issues/255)
 - [#256](https://github.com/bounswe/bounswe2024group9/pull/256) 
 - [#257](https://github.com/bounswe/bounswe2024group9/pull/257)
 - [#280](https://github.com/bounswe/bounswe2024group9/pull/280) 
 - [#293](https://github.com/bounswe/bounswe2024group9/pull/293)
 - [#306](https://github.com/bounswe/bounswe2024group9/pull/306)
 - [#344](https://github.com/bounswe/bounswe2024group9/pull/344)
### Tests
 - Unit Tests
        - [Tests for question_views and utilization_views](https://github.com/bounswe/bounswe2024group9/pull/307)


### Additional Information

Since the last milestone reviewed [#331](https://github.com/bounswe/bounswe2024group9/pull/331)

   
</details>

<details>
<summary><strong>Eray Eroğlu</strong></summary>
    
### General Information
    
* Group 9
    * Subgroup: Web application
* Responsibilities: 
    * web application: Question Posting Page, Feed Page and Searching Mechanism
    * back end: Implementation of question listing endpoint with respect to time, popularity and tags ; implementation of the backend for user searching mechanism
    
### Main Contribution
- Implementation of question posting page
- Implemantation of feed page
- Syntax highlighting for code snippets
- Working on the bug fix causing the crash of CSS modules between feed and login

### Code-related significant issues:
 - [#204](https://github.com/bounswe/bounswe2024group9/issues/204)
 - [#226](https://github.com/bounswe/bounswe2024group9/issues/226)
 - [#276](https://github.com/bounswe/bounswe2024group9/issues/276)
 - [#288](https://github.com/bounswe/bounswe2024group9/issues/288)
 - [#291](https://github.com/bounswe/bounswe2024group9/issues/291)
 - [#304](https://github.com/bounswe/bounswe2024group9/issues/304)
 - [#325](https://github.com/bounswe/bounswe2024group9/issues/325)
 - [#342](https://github.com/bounswe/bounswe2024group9/issues/342)    
### Pull Requests:
 -  [PR #204](https://github.com/bounswe/bounswe2024group9/pull/204) 
 -  [PR #227](https://github.com/bounswe/bounswe2024group9/pull/227) 
 -  [PR #232](https://github.com/bounswe/bounswe2024group9/pull/232) 
 -  [PR #233](https://github.com/bounswe/bounswe2024group9/pull/233) 
 -  [PR #234](https://github.com/bounswe/bounswe2024group9/pull/234) 
 -  [PR #245](https://github.com/bounswe/bounswe2024group9/pull/245) 
 -  [PR #248](https://github.com/bounswe/bounswe2024group9/pull/248) 
 -  [PR #310](https://github.com/bounswe/bounswe2024group9/pull/310) 
 -  [PR #318](https://github.com/bounswe/bounswe2024group9/pull/318) 
 -  [PR #357](https://github.com/bounswe/bounswe2024group9/pull/357) 
   
</details>


<details>
<summary><strong>Mustafa Mutti Atak</strong></summary>
    
### General Information
    
* Group 9 / Back-end & Web Front-End
* Responsibilities: 
    Back End: 
    
    - Writing endpoints for general CRUD tasks. 
    - Deployment and Database.
    - Documenting backend.
   
    Web Front End: 
    - Fixing design mistakes on frontend.
    
### Main Contributions
    - Fixing slow loading issues. 
    - Deploying the app.
    - Database migrations.
    - Implementing paging and filtering for the questions.
    - Adding AI quality control for questions. (Removed after Milestone 2
    - Adding Notifications instead of chrome alerts.
    - Documenting the backend via swagger and inline commenting. ( Swagger is not working on remote link for security reason. Should be controlled locally. )
    - Implementing CRUD functionalities for question, comment, annotation, user.
    - Fetching the data for Feed and Search Result, Profile pages. 
    - Solved security problem with [dependabot](https://github.com/bounswe/bounswe2024group9/pull/281).
    - Created mail system and an account just for pasasword reset.
    
    
### Code Related Significant issues
 - [#228](https://github.com/bounswe/bounswe2024group9/issues/228)
 - [#250](https://github.com/bounswe/bounswe2024group9/issues/250)
 - [#263](https://github.com/bounswe/bounswe2024group9/issues/263)
 - [#268](https://github.com/bounswe/bounswe2024group9/issues/268)
 - [#270](https://github.com/bounswe/bounswe2024group9/issues/270)
 - [#278](https://github.com/bounswe/bounswe2024group9/issues/278)
 - [#283](https://github.com/bounswe/bounswe2024group9/issues/283)
 - [#292](https://github.com/bounswe/bounswe2024group9/issues/292)
 - [#296](https://github.com/bounswe/bounswe2024group9/issues/296)
- [#323](https://github.com/bounswe/bounswe2024group9/issues/323)
- [#325](https://github.com/bounswe/bounswe2024group9/issues/325)
- [#330](https://github.com/bounswe/bounswe2024group9/issues/330)
- [#337](https://github.com/bounswe/bounswe2024group9/issues/337) 
- [#343](https://github.com/bounswe/bounswe2024group9/issues/343)  
- [#346](https://github.com/bounswe/bounswe2024group9/issues/337)
    
    
### Management-related significant issues:
 - [#271](https://github.com/bounswe/bounswe2024group9/issues/271)
 - [#282](https://github.com/bounswe/bounswe2024group9/issues/282)
    
### Pull Requests 
 - [PR #210](https://github.com/bounswe/bounswe2024group9/pull/210) 
 - [PR #223](https://github.com/bounswe/bounswe2024group9/pull/223) 
 - [PR #236](https://github.com/bounswe/bounswe2024group9/pull/236) 
 - [PR #251](https://github.com/bounswe/bounswe2024group9/pull/251) 
 - [PR #252](https://github.com/bounswe/bounswe2024group9/pull/252)
 - [PR #259](https://github.com/bounswe/bounswe2024group9/pull/259) 
 - [PR #284](https://github.com/bounswe/bounswe2024group9/pull/284) 
 - [PR #285](https://github.com/bounswe/bounswe2024group9/pull/285) 
 - [PR #286](https://github.com/bounswe/bounswe2024group9/pull/286) 
 - [PR #297](https://github.com/bounswe/bounswe2024group9/pull/297)
- [PR #319](https://github.com/bounswe/bounswe2024group9/pull/319)
- [PR #324](https://github.com/bounswe/bounswe2024group9/pull/324)
- [PR #329](https://github.com/bounswe/bounswe2024group9/pull/329)
- [PR #331](https://github.com/bounswe/bounswe2024group9/pull/331)
- [PR #345](https://github.com/bounswe/bounswe2024group9/pull/345)
- [PR #355](https://github.com/bounswe/bounswe2024group9/pull/351)
- [PR #351](https://github.com/bounswe/bounswe2024group9/pull/355)

### Tests
 - Unit Tests
    - [Code execution search](https://github.com/bounswe/bounswe2024group9/pull/251/files)
    - [While testing swagger I controlled every backend endpoints.](https://github.com/bounswe/bounswe2024group9/pull/320/files) (Until the fixes made in Mehmet Emins commit.)


### Additional Information

No specific issue opened about that but I helped my friends every time when they encounter with a problem on backend or web frontend.
   
</details>


<details>

<summary><strong>Damla Kayıkçı</strong></summary>

### General Information
    
* Group 9

* Subgroup: back end (until the first milestone), web front end (from the first milestone to fonal milestone)
* Responsibilities: 
    * back end: fetching info from wikipedia + wikidata 
    * web front end: Feed page, Search Results page, Quesiton Details page

### Main Contributions
    
- The logic for fetching info from Wikipedia
- Creation of Search Result page 
- Imporvements in Question details page
- Feed debugging, improving style
- Design of annotations in the web 
- Creation of Survey Page
- Docker
### Code Related Significant issues
- [Code Related Significant Issues from Milestone 1](https://github.com/bounswe/bounswe2024group9/blob/main/reports/m1_group9.md#:~:text=project%20PR%20%232228-,Code%2Drelated%20significant%20issues%3A,-%2D%2D%20For%20me%20the)
- [Code Related Significant Issues from Milestone 2](https://github.com/bounswe/bounswe2024group9/blob/main/reports/m2_group9.md#code-related-significant-issues:~:text=65%2C%20%22parent_id%22%3A%20null%20%7D-,Code%2Drelated%20significant%20issues,-%3A)
### Management Related Significant Issues
- [Management Related Significant Issues from Milestone 1](https://github.com/bounswe/bounswe2024group9/blob/main/reports/m1_group9.md#:~:text=and%20back%2Dend-,Non%2Dcode%2Drelated%20significant%20issues,-%3A%20%2D%2D%20We%20had%20some)

### Pull Requests 
 Previous Milestones
    
- [#214](https://github.com/bounswe/bounswe2024group9/pull/214)
- [#244](https://github.com/bounswe/bounswe2024group9/pull/244)
- [#237 ](https://github.com/bounswe/bounswe2024group9/pull/237)
- [#308](https://github.com/bounswe/bounswe2024group9/pull/308)
- [#252 - reviewer](https://github.com/bounswe/bounswe2024group9/pull/252)
 - [#265](https://github.com/bounswe/bounswe2024group9/pull/265)
 - [#287](https://github.com/bounswe/bounswe2024group9/pull/287)
 - [#280 - reviewer](https://github.com/bounswe/bounswe2024group9/pull/280)
 - [#284 - reviewer](https://github.com/bounswe/bounswe2024group9/issues/284)
 - [#286 - reviewer](https://github.com/bounswe/bounswe2024group9/issues/286)
 - [#294 - reviewer](https://github.com/bounswe/bounswe2024group9/issues/294)
 - [#315 - reviewer](https://github.com/bounswe/bounswe2024group9/pull/315)



Final Milestone
 - [#333 - Bookmarks](https://github.com/bounswe/bounswe2024group9/pull/333)
 - [#353 - Question Details page improvements](https://github.com/bounswe/bounswe2024group9/pull/353) 
 - [#324 - reviewed](https://github.com/bounswe/bounswe2024group9/pull/324)

</details>
<details>
<summary><strong>Fatih Akgöz</strong></summary>
    
### General Information
    
* Group 9
    * Subgroup: Web application
* Responsibilities: 
    * web application: Question Details Page
    
### Main Contribution
- Implementation of question details page.
- Implementation of discussion type of posts.
- Syntax highlighting for code snippets.
- Fixing code execution button and output textbox for questions, discussions and comments.
- Bug fix on causing errors in post editing, comment editing, annotation.
- Adding wiki page links to question language and tags.

### Code-related significant issues:
 - [#328](https://github.com/bounswe/bounswe2024group9/issues/328)
 - [#340](https://github.com/bounswe/bounswe2024group9/issues/340)
 - [#342](https://github.com/bounswe/bounswe2024group9/issues/342)
     
### Pull Requests:
 -  [PR #353](https://github.com/bounswe/bounswe2024group9/pull/353) 
 -  [PR #349](https://github.com/bounswe/bounswe2024group9/pull/349) 
 -  [PR #354](https://github.com/bounswe/bounswe2024group9/pull/354)
 -  [PR #348](https://github.com/bounswe/bounswe2024group9/pull/348) 
 -  [PR #351](https://github.com/bounswe/bounswe2024group9/pull/351) 
   
</details>
    
<details>
<summary><strong>Huriye Ceylin Gebes</strong></summary>
    
### General Information
    
* Group 9
* Subgroup: web frontend (feed, profile, login, signup, search results, annotations at search results), management (reports)
* Responsibilities: 
    * web frontend: Feed development, profile page development, post creation page development, search results page, login&signup pages, web annotations, addition of discussion post type to the feed, post creation and post details pages, authentication wrapper
    * backend: bug fixing & improvements on profile related backend functions (within great collaboration of Mutti)
    * management: milestone reports

### Main Contributions
    
- Development of the Profile page on web
- Development of the Feed page on web
- Development of the Login&Signup pages on web
- Development of Post Creation page on web
- Development of the navigation bar on web
- Annotations in the web logic and display
- Implementation of discussion posting in web app

### Code Related Significant Issues

- [Code Related Significant Issues from Milestone 1](https://github.com/bounswe/bounswe2024group9/blob/main/reports/m1_group9.md#:~:text=%2C%20PR%20%23223-,Code%2Drelated%20significant%20issues,-%3A%20%2D%2D%20One%20of%20the)
- [Code Related Significant Issues from Milestone 2](https://github.com/bounswe/bounswe2024group9/blob/main/reports/m2_group9.md#code-related-significant-issues)
- For the final milestone, [#337](https://github.com/bounswe/bounswe2024group9/issues/337)
### Management Related Significant Issues
- [Management Related Significant Issues from Milestone 1](https://github.com/bounswe/bounswe2024group9/blob/main/reports/m1_group9.md#:~:text=Non%2Dcode%2Drelated-,significant%20issues%3A,-%2D%2D%20There%20were%20missed)
- [Management Related Significant Issues from Milestone 2](https://github.com/bounswe/bounswe2024group9/blob/main/reports/m2_group9.md#management-related-significant-issues)

### Pull Requests 

- Milestone 1
    
-- [PR#246](https://github.com/bounswe/bounswe2024group9/pull/246) -- [PR#231](https://github.com/bounswe/bounswe2024group9/pull/231) 
-- [PR#232 (merged)](https://github.com/bounswe/bounswe2024group9/pull/232) 
-- [PR#233 (merged)](https://github.com/bounswe/bounswe2024group9/pull/233) 
-- [PR#228 (reviewed)](https://github.com/bounswe/bounswe2024group9/pull/228) 
-- [PR#227 (contributed)](https://github.com/bounswe/bounswe2024group9/pull/227) 
-- [PR#234 (contributed)](https://github.com/bounswe/bounswe2024group9/pull/234) 
-- [PR#242 (contributed)](https://github.com/bounswe/bounswe2024group9/pull/242) 
-- [PR#243 (contributed)](https://github.com/bounswe/bounswe2024group9/pull/243) 

- Milestone 2

-- [PR#294](https://github.com/bounswe/bounswe2024group9/pull/294)
-- [PR#265 (contributed, reviewed)](https://github.com/bounswe/bounswe2024group9/pull/294)
-- [PR#252 (contributed)](https://github.com/bounswe/bounswe2024group9/pull/252) 
-- [PR#259 (contributed, reviewed)](https://github.com/bounswe/bounswe2024group9/pull/259)
-- [PR#286 (contributed)](https://github.com/bounswe/bounswe2024group9/pull/286) 
-- [PR#293 (reviewed)](https://github.com/bounswe/bounswe2024group9/pull/293)

- Final Milestone

-- [PR#351](https://github.com/bounswe/bounswe2024group9/pull/351)
-- [PR#347](https://github.com/bounswe/bounswe2024group9/pull/347)
-- [PR#344 (reviewed)](https://github.com/bounswe/bounswe2024group9/pull/344)

### Additional Information
Even though there isn’t a specific issue related to these, I was responsible for keeping track of customer feedbacks and improvements that are expected to be done by the customer during the semester. They can be found there customer feedback notes for all the milestones. Additionally, wrote the assigned parts of system manual part of this report.

</details>

<details>
<summary><strong>Halil Karabacak</strong></summary>

* Group 9
    * Subgroup: Mobile
* Responsibilities: 
    * mobile app : whole app, evreything related to mobile
    
### Main Contribution
- Implementation of Login, Signup, Search, Post Cration, Profile, Bookmark, Top Contributor, Feed, Post Detail, Feed Item pages.
- Implementation of syntax highlighting.
- Implementation of annotation in search result and discussion details page.
- Deciding everything related to mobile including UI/UX, page designs, data flow, etc.


### Code-related significant issues:
 - [#334](https://github.com/bounswe/bounswe2024group9/issues/334)
 - [#336](https://github.com/bounswe/bounswe2024group9/issues/336)
 - [#299](https://github.com/bounswe/bounswe2024group9/issues/299)
 - [#238](https://github.com/bounswe/bounswe2024group9/issues/238)
 - [#230](https://github.com/bounswe/bounswe2024group9/issues/230)
 - [#298](https://github.com/bounswe/bounswe2024group9/issues/298)
 - [#335](https://github.com/bounswe/bounswe2024group9/issues/335)
     
### Pull Requests:
 -  [PR #191](https://github.com/bounswe/bounswe2024group9/pull/191) 
 -  [PR #153](https://github.com/bounswe/bounswe2024group9/pull/153) 
 -  [PR #347](https://github.com/bounswe/bounswe2024group9/pull/347)
 -  [PR #316](https://github.com/bounswe/bounswe2024group9/pull/316) 
 -  [PR #315](https://github.com/bounswe/bounswe2024group9/pull/315) 
  
### Additional Information
- Completed User manual for both mobile and web app in this report.
</details>
    
    
<details>
<summary><strong>Mehmet Emin İpekdal</strong></summary>
    
### General Information
    
* Group 9
    * Subgroup: backend, web frontend
* Responsibilities: 
    * back end: Cover the newly added functions (such as get_question_details, get_comment_details, get_bookmark_details) in models.py with unittests and integrity tests. Cover the newly added API calls or the API calls which did not have the logic implementation before in user_views.py, comment_views.py and utilization_views.py with unittests and integrity tests.
    * web front end: Fix the requests calling the wrong urls within the api calls. Improvements on syntax highlighting in code execution blocks.

### Main Contributions: 
- I have fixed some duplicate URLs, and some error codes. A few error codes were returning different error codes from the usual, I have spent a significant time resolving those error codes and their compatibility with my tests.
- Enhanced the test coverage and functionality for user, comment, question, vote models, and associated views. Refactored and extended test cases for User, Comment, Question, and Vote models to ensure that all critical functionalities are covered. Also aligned the test cases with updated model behavior.
- Refactoring and Fixing UserViewsTests: Improved Reliability and Expanded Test Coverage. Restructured tests to use consistent authentication mechanisms, ensuring the proper use of access tokens (Bearer scheme) and client credentials for authenticated requests. Fixed incorrect handling of HTTP methods in test_upload_profile_pic. Added specific assertions for 405 Method Not Allowed responses for unsupported methods (e.g., GET).
- Since some functionality in question_views.py relies on querying multiple databases I added databases = {'default', 'annotations'} in QuestionViewTests. I also added test_create_question_missing_fields and test_delete_question_unauthorized tests in order to see if those functions return correct error codes (such as "403 Forbidden") under inappropriate request conditions. Also I used @patch to mock external calls since it allows me to without depending on external db calls.
- Also I have commented some function tests in CommentViewsTest and UtilsViews classes since they were encountering some errors and they were the reason our assistant could not run all the tests properly.
- Overall, the changes emphasize robust coverage of both happy and unhappy paths, improving reliability, maintainability, and confidence that the application behaves correctly under various conditions, with the mocking strategies, clarified database usage, more comprehensive error handling checks and upgrading the testing scenarios.

### Significant issues:

 - [#360](https://github.com/bounswe/bounswe2024group9/issues/360)
 - [#328](https://github.com/bounswe/bounswe2024group9/issues/328)

### Pull Requests:

- [PR #359](https://github.com/bounswe/bounswe2024group9/pull/359)

### Additional Information:

- I have spent most of my time with fixing the errors in frontend and debugging the functionality of newly added methods and fixing conflicts appeared due to other branches' merge to main.

</details>
        

# Project Artifacts

## User Manual
    
### Web Application

#### Getting Started
1. **Access the Application**:
   - Open a browser and navigate to the web application URL (provided in the report).

2. **Sign Up/Log In**:
   - If you're a new user, click the **Sign Up** button and fill in the following information:
    -- A valid e-mail address
    -- A unique username
    -- A strong password that fits the criteria (explain)
    -- Accept the KVKK terms related to how your data will be handled.
    - After filling up the required info, you should fill the survey. This survey will later influence your experience in the app by changing posts in your feed.
   - Existing users can log in by clicking **Log In** and entering their credentials.
#### Features

1. **Home/Feed Page**:
   - View posts related to your interests based on tags you selected in the survey.
   - Use filters to sort and customize the displayed posts (e.g., by language, tags, time).
    - Learn what others are interacting with via "Question of the Day" feature.
    - Top contributors are shown on the right side of the screen.

2. **Post Questions**:
   - Navigate to the **Ask a Question** page by clicking on the "+" sign at the right bottom of the page.
    - Depending on the type of your post whether it would be a discussion or question select the appropriate type. 
   -- If it is a question post, fill in the title, details, and code snippet fields, and select relevant tags and programming languages.
    -- If it is a discussion post, you can just fill title, details, and select tags related your idea.
    - After filling this areas you can either discard your question by clicking on "Cancel" button or share it with "Submit" button.

3. **Search**:
   - Use the search bar to find terms related to computer science and learn more about them with the info provided by wikidata.
   - In a search result page wou will be shown the following sections related your search item:
    -- Inception date
    -- Website
    -- Influenced by
    -- Wikipedia link
    -- Related Instancens
    -- Type of the object (Object oriented, functional etc.)
    -- A simple explanation 
    - Besides all information, this page supports annotation to cerate a more dynamic page where users can share their insights and making it more alive rather than a concrete description block sitting.

4. **View and Answer Questions**:
    - In feed page, you can see a summary of a post asked by other users. It briefly gives a description, title, and, tags OP selected for his post.
   - Click on a question on feed page to view its details.
    - In the post detail page, you can interact with the post. This interaction includes simple functionalities such upvoting, downvoting, and, bookmarking for later access. 
   - A more advanced feature is, add comments or answers with optional code snippets that can be executed.
   - Execute provided code snippets directly within the application. App supports syntax highlighting so debugging could be done easier on the browser.
   - View the output or any error messages.

5. **Annotations**:
   - Highlight sections of a question or comment to add an annotation.
   - Reply to, edit, or delete annotations.

6. **Profile Management**:
   - Access your profile to view your posts, comments, bookmarks, and annotations.
   - Edit your profile details, such as bio and profile picture.

### Mobile Application
- Mobile app also provides most of the functionality offered in web app with minor differences and different design choices due to the screen size available.  
#### Getting Started
- Login and Signup processes follow the same steps as the web application.
  #### Features

1. **Home/Feed Page**:
    - Similar to web app, koduyorum mobile also provides almost same feed experince with minor differences.
    - "Top Question of the Day" is not shown the mobile feed.
    -  Top contributors are not shown in the feed. To reach top contributors, you need swipe from right to left and click on "Top Contributors" button.
    - There is no question filtering in the mobile app. 
    - The rest is the same experience related to post content and interaction.
    
    
2. **Post Questions**:
    - Similar to web, you can post different type of posts in mobile as well. The required fields are the same for both apps.
    - The rest is the same experience with post creation process.
    
3. **Search**:
    - Differently from the web app, you can search for both wikidata and posts shared by other users in the mobile app.
    - Search result page also differs. In mobile app a wikidata result page consists of:
    -- Wikipedia link
    -- Descriptive text that can be annotated.
    
4. **View and Answer Questions**:
- Unlike web app which supports annotation on both discussion and question type of posts, mobile app supports only in the discussion type of posts.
    - In mobile app, only the code snippet related to post can be executed. Users commets cannot be executed.
    - Answering mechanism and required fields are same with the web app.
    
5. **Annotations**:
    - To add an annotation, click on the text you want to start and end. The selected part will be highlighted and a small window will appear asking you to enter your annotation.
    - After entering your annotation, you can either "Submit" or "Cancel" it. 
    - To see content of the annotations, you can click on an annotation which is highlighted with a darker color and see all the content and replies (if existing) to annotation you are interacting with.
    - Same experience with the web app.

6. **Profile Management**:
    - To get into the profile page, users should swipe the screen from left to right. This modal will show profile photo, username, "Top Contributors", and "Bookmarks" button. 
    - Profile photo and username directs user to the profile page which simply shows the posts shared by the user.
    - Web and mobile app differs in the information presented here. Mobile app doesn't show comments, bookmarks (in another page), and annotation history.

    
## System Manual
### 1. System Requirements 
#### Web Application 
- **Operating System**: Windows 10 or later, macOS 10.15 or later, Linux (Ubuntu 20.04 or later recommended). 
- **Browser**: Google Chrome, Firefox, Edge, Safari (latest versions). 
- **RAM**: Minimum 4GB (8GB or 16 GB recommended). 
- **Disk Space**: Minimum 1 GB free for application files and dependencies (node modules etc.). 
- **Other Software**: 
-- Node.js (version 23.x or later) 
-- npm (version 10.x or later) 
-- Docker Desktop (version 4.24.x or later)

#### Backend Server
- **Operating System**: Windows 10 or later, macOS 10.15 or later, Linux (Ubuntu 20.04 or later recommended). 
- **RAM**: Minimum 4GB (8GB or 16 GB recommended). 
- **Disk Space**: Minimum 1 GB free for application data and dependencies. 
- **Python Version**: 3.11.x or later
- **Other Software**: 
-- MySQL (version 9.0.x or later)
-- Docker Desktop (version 4.24.x or later)
-- Django (version 5.1.2)

#### Mobile Application
 - 8GB RAM
 - 32 GB Storage 
 - Android 12 or above

 - Android – we recommend a minimum of 4 GB of RAM an­­d a screen size greater than 5 inches.  
 - Stable internet connection    

### 2. How to Run the Web Application on Local (with Docker)

**1. Clone the Repository**: 
```bash
git clone https://github.com/bounswe/bounswe2024group9.git
cd bounswe2024group9
```

**2. Create .env Files:** 
- In the scope of the koduyorum-web directory, create an .env file and add the following keys:
```
AWS_PASSWORD=XXXXXXXXXX
AWS_HOST=XXXXXXXXXX
DJANGO_SECRET_KEY=XXXXXXXXXX
JUDGE0_API_KEY_POOL=XXXXXXXXXX
REACT_APP_API_URL=XXXXXXXXX`
```

- In the scope of the django_project_491 directory, create an .env file and add the following keys:
```
AWS_DEFAULT_PASSWORD=XXXXXXXXXX
AWS_DEFAULT_HOST=XXXXXXXXXX
AWS_PASSWORD=XXXXXXXXXX
AWS_HOST=XXXXXXXXXX
AWS_ANNOTATIONS_PASSWORD=XXXXXXXXXX
AWS_ANNOTATIONS_HOST=XXXXXXXXXX
DJANGO_SECRET_KEY=XXXXXXXXXX
JUDGE0_API_KEY_POOL=XXXXXXXXXX
REACT_APP_API_URL=XXXXXXXXXX
REACT_APP_FRONTEND_URL=XXXXXXXXXX
EMAIL_HOST_USER=XXXXXXXXXX
EMAIL_HOST_PASSWORD=XXXXXXXXXX
GEMINI_AI_KEY_POOL=XXXXXXXXXX
```

**3. Run the Docker Image:** In the outermost scope of the project directory, run the following command:
```bash
docker compose up
```

**4. Access the Applications:**
- Backend: http://localhost:8000
- Web Application: http://localhost:3000

    
### 3. How to Run the Backend Server on Local (with Docker)
    // after navigating to /django_project_491
    python manage.py runserver
    
### 3. How to Run the Mobile Application
**1. Check prerequisites.**
In the koduyorum folder project directory, run the following command:
```
npx react-native doctor
```
![npx react-native doctor](https://github.com/user-attachments/assets/e7c444ad-981e-4431-beb6-a9ebd72d6d01)

**2.Install missing packages listed above including Android Studio and adb.**

**3.Start Android Emulator from Android Studio.**

**4. Build the code and install on Android Emulator.**
In the koduyorum folder project directory, run the following command:
```
npm run android
```
# Other Artifacts

## [Software Requirements Specification (SRS)](https://github.com/bounswe/bounswe2024group9/wiki/451-%E2%80%90-Requirements)
## [Software Design Documents (using UML)](https://github.com/bounswe/bounswe2024group9/wiki/451-%E2%80%90-Design-Diagrams)
## User [Scenarios](https://github.com/bounswe/bounswe2024group9/wiki/451-%E2%80%90-Scenarios) and [Mockups](https://github.com/bounswe/bounswe2024group9/wiki/451-%E2%80%90-Mockups)
## [Project Plan](https://github.com/bounswe/bounswe2024group9/wiki/Long%E2%80%90term-planning-451)
## Unit Tests
  - [Back End](https://github.com/bounswe/bounswe2024group9/blob/main/django_project_491/django_app/test.py)
  - Web Front End
      - [Search Results](https://github.com/bounswe/bounswe2024group9/blob/main/koduyorum-web/src/SearchResults.test.js)


