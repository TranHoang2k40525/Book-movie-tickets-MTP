document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch review statistics
        const response = await api.get('/reviews/stats/all');
        const reviewData = response.reviews;

        // Populate the table
        const tableBody = document.getElementById('reviewTableBody');
        reviewData.forEach(movie => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${movie.MovieTitle}</td>
                <td>${movie.ReviewCount}</td>
                <td>${movie.AverageRating ? movie.AverageRating.toFixed(1) : '-'}</td>
                <td>${movie.PositiveReviews} (${movie.ReviewCount ? ((movie.PositiveReviews / movie.ReviewCount) * 100).toFixed(1) : 0}%)</td>
                <td>${movie.NegativeReviews} (${movie.ReviewCount ? ((movie.NegativeReviews / movie.ReviewCount) * 100).toFixed(1) : 0}%)</td>
            `;
            tableBody.appendChild(tr);
        });

        // Setup review distribution chart
        const distributionCtx = document.getElementById('reviewDistributionChart').getContext('2d');
        new Chart(distributionCtx, {
            type: 'pie',
            data: {
                labels: reviewData.map(movie => movie.MovieTitle),
                datasets: [{
                    data: reviewData.map(movie => movie.ReviewCount),
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40',
                        '#FF6384',
                        '#36A2EB'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    title: {
                        display: true,
                        text: 'Review Distribution by Movie'
                    }
                }
            }
        });

        // Setup average ratings chart
        const ratingsCtx = document.getElementById('averageRatingsChart').getContext('2d');
        new Chart(ratingsCtx, {
            type: 'bar',
            data: {
                labels: reviewData.map(movie => movie.MovieTitle),
                datasets: [{
                    label: 'Average Rating',
                    data: reviewData.map(movie => movie.AverageRating),
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Average Movie Ratings'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading review data:', error);
        alert('Failed to load review data');
    }
});