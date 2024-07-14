onload=start;

async function start(){await test0();}

async function test0(){
  const content = document.getElementById('content');
  const loading = document.getElementById('loading');

  let page = 1;
  const limit = 20; // Number of items to load per page
  let isLoading = false;

  // Function to fetch new content
  const loadMoreContent = () => {
    if (isLoading) return;
    isLoading = true;
    loading.style.display = 'block';

    // Simulate an API call with setTimeout
    setTimeout(() => {
      for (let i = 0; i < limit; i++) {
        const item = document.createElement('div');
        item.className = 'item';
        item.textContent = `Item ${(page - 1) * limit + i + 1}`;
        content.appendChild(item);
      }
      page++;
      isLoading = false;
      loading.style.display = 'none';
    }, 1000);
  };

  // Function to check if the user has scrolled to the bottom
  const handleScroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
      loadMoreContent();
    }
  };

  // Initial load
  loadMoreContent();

  // Event listener for scrolling
  window.addEventListener('scroll', handleScroll);
}
