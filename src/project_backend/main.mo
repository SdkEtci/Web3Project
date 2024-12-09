import Array "mo:base/Array";

// Define the BookTracker actor with its functionality
actor BookTracker {

    // Define the Book type with title, score, and comment inside the actor
    type Book = {
        title: Text;
        score: Nat;      // Score from 1 to 10
        comment: Text;   // A short review of the book
    };

    // Stable variable to store all books
    stable var books: [Book] = [];

    // Function to add a book
    public func addBook(title: Text, score: Nat, comment: Text): async Book {
        let newBook: Book = {
            title = title;
            score = score;
            comment = comment;
        };
        books := Array.append(books, [newBook]);
        return newBook;
    };

    // Function to update a book's comment based on the title
    public func updateBookComment(title: Text, newComment: Text): async ?Book {
        // Use Array.map to create a new array with updated book comment
        var updatedBooks: [Book] = Array.map(books, func(b: Book) : Book {
            if (b.title == title) {
                return { title = b.title; score = b.score; comment = newComment }; // Update comment
            } else {
                return b; // Keep the other books unchanged
            };
        });

        // Check if the books array has been updated
        if (updatedBooks != books) {
            books := updatedBooks; // Apply the changes to the books array
            return ?updatedBooks[0]; // Return the updated book
        };

        return null; // Return null if the book with the given title was not found
    };

    // Function to delete a book by its title
    public func deleteBook(title: Text): async Bool {
        // Use Array.filter to remove the book with the given title
        let updatedBooks = Array.filter(books, func(b: Book) : Bool {
            b.title != title // Keep books whose title is not the one we want to delete
        });

        if (updatedBooks.size() != books.size()) {
            books := updatedBooks; // Apply the change to the books array
            return true; // Successfully deleted
        } else {
            return false; // No book was found to delete
        };
    };

    // Query function to get all books
    public query func getAllBooks(): async [Book] {
        return books;
    };
};