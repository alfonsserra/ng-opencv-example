import { Component, OnInit } from '@angular/core';

declare var cv: any;

@Component({
	selector:    'app-root',
	templateUrl: './app.component.html',
	styleUrls:   ['./app.component.scss']
})
export class AppComponent implements OnInit {

	public title = 'Reactive Forms';
	public disabled = false;

	constructor() {
	}

	public ngOnInit(): void {
	}

	public readFile(event:any) {
		const imgElement:any = document.getElementById('imageOriginal');
		imgElement.onload = function() {
			const mat = cv.imread(imgElement);
			cv.imshow('imageCanvas', mat);
		};
		imgElement.src = URL.createObjectURL(event.target.files[0]);

	}

	public calculate() {
		console.log('Here');
		this.disabled = true;

		const mat = cv.imread('imageCanvas');
		const dst = mat.clone();
		const circles = new cv.Mat();
		cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY, 0);
		// You can try more different parameters
		cv.HoughCircles(mat, circles, cv.HOUGH_GRADIENT,
			1, 45, 75, 40, 0, 0);
		// draw circles
		for (let i = 0; i < circles.cols; ++i) {
			const x = circles.data32F[i * 3];
			const y = circles.data32F[i * 3 + 1];
			const radius = circles.data32F[i * 3 + 2];
			const center = new cv.Point(x, y);
			cv.circle(dst, center, radius, [0, 0, 0, 255], 3);
		}

		cv.imshow('imageCanvas', dst);
		mat.delete();
		dst.delete();
		circles.delete();

		this.disabled = false;
	}
}
