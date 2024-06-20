

# Route Planner

Route Planner is a web application that allows users to calculate the distance and ETA (Estimated Time of Arrival) from a starting point to a destination with optional stops (waypoints) using Google Maps. The app also provides a shareable link for the calculated route.

## Features

- Calculate distance and ETA using Google Maps API.
- Add multiple waypoints (stops) to your route.
- Select travel mode: Driving, Bicycling, Transit, Walking.
- Generate a shareable URL for your route.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/en/) (v14.0.0 or later)
- [npm](https://www.npmjs.com/) (v6.0.0 or later)

## Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/Ravish108Coder/graviti-frontend-assignment
    cd route-planner
    ```

2. **Install the dependencies:**

    ```bash
    npm install
    ```

3. **Set up environment variables:**

    Create a `.env` file in the root directory of your project and add your Google Maps API key:

    ```env
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
    ```

4. **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Files

- **`components`**: Contains the main React components used in the application.
- **`public`**: Contains static assets such as images and icons.
- **`styles`**: Contains the CSS files for styling the application.
- **`.env`**: Environment variables for the project.
- **`next.config.js`**: Configuration file for Next.js.
- **`package.json`**: Lists the project dependencies and scripts.

## Usage

1. **Enter your starting point:**

   Use the autocomplete input to enter your starting point.

2. **Enter your destination:**

   Use the autocomplete input to enter your destination.

3. **Add waypoints (optional):**

   Click the "Add Stop" button to add waypoints (stops) to your route.

4. **Select travel mode:**

   Choose from Driving, Bicycling, Transit, or Walking.

5. **Calculate distance and ETA:**

   After entering all the details, the distance and ETA will be calculated and displayed.

6. **Generate shareable URL:**

   Click the "Copy Link" button to copy the shareable URL to your clipboard. You can share this link with others to show them the calculated route.

## Live Demo

Check out the live deployed version of the Route Planner [here](https://graviti-frontend-assignment.vercel.app/).

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Google Maps API](https://developers.google.com/maps)
- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)

## Contact

If you have any questions, feel free to contact:

- Ravish Kumar - [kravish1999@gmail.com](mailto:kravish1999@gmail.com)
- [Your GitHub](https://github.com/Ravish108Coder)

---

Thank you for using Route Planner!