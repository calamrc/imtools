import './App.css';

export default function App() {
  function handleSubmit(e) {
    // Prevent the browser from reloading the page
    e.preventDefault();

    // Read the form data
    const form = e.target;
    const formData = new FormData(form);

    // You can pass formData as a fetch body directly:
    fetch('https://rccalam.pythonanywhere.com/', { method: form.method, body: formData });

    // Or you can work with it as a plain object:
    const formJson = Object.fromEntries(formData.entries());
    console.log(formJson);
  }

  return (
    <form method="post" onSubmit={handleSubmit}>
      <div>
        <label>
          Patient Information
        </label>
      </div>
      <div>
        <textarea
          name="postContent"
          rows={4}
          cols={40}
        />
      </div>
      <hr />
      <button type="submit">Generate</button>
    </form>
  );
}

