# Project Title

BBY07 Waste Sorting App

# Project Live Link

https://comp1800-202330-bby07.web.app/

## 1. Project Description
The app lets people search for an item they don’t know how to dispose of, and the app will tell them which bin it goes in, along with any extra information the contributor wanted to provide about it.
The data is also crowdsourced and crowd-moderated, it lets people upload items, what bin each item should be thrown into and a description for them. Once an item is uploaded it lets people vote on how helpful or unhelpful they are, automatically deleting them if they reach a set negative threshold.

## 2. Names of Contributors
List team members and/or short bio's here... 
* Guido He
* Radmir G
* Donghoon
	
## 3. Technologies and Resources Used
List technologies (with version numbers), API's, icons, fonts, images, media or data sources, and other resources that were used.
* HTML, CSS, JavaScript, JQuery
* Bootstrap 5.0 (Frontend library)
* Firebase 8.0 (BAAS - Backend as a Service)
* Google Fonts
* Google Material Symbols (for icons)

## 4. Complete setup/installion/usage
State what a user needs to do when they come to your project.  How do others start using your code or application?
Here are the steps ...
* Set firestore and firebase storage configurations in the file "firebaseAPI_BBY07 (template)" and rename to "firebaseAPI_BBY07"
* Run as live server
* If trying to deploy, change name of project inside ".firebaserc" file to firebase project name.

## 5. Known Bugs and Limitations
Here are some known bugs:

## 6. Features for Future
What we'd like to build in the future:
* Editing of items.
* Search history of users.
* Change sorting criteria of item lists.
* Track number of clicks on each item to be able to sort by most searched.
	
## 7. Contents of Folder
Content of the project folder:

```
 Top level of project folder: 
├── .gitignore               # Git ignore file
├── search.html               # landing HTML file, this is what users see when you come to url
└── README.md

It has the following subfolders and files:
├── .git                     # Folder for git repo
├── components               # Folder for reusable components
├── images                   # Folder for images
├── scripts                  # Folder for scripts
├── styles                   # Folder for styles
```


