import { Component, ElementRef, ViewChild } from '@angular/core';

declare var cv: any;

@Component({
	selector:    'app-root',
	templateUrl: './app.component.html',
	styleUrls:   ['./app.component.scss']
})
export class AppComponent {

	public title = 'Open CV';
	public disabled = false;
	public fileName = 'Choose file';

	@ViewChild('originalImage') public originalImage: ElementRef;

	constructor() {
	}

	public readFile(event: any) {
		this.fileName = event.target.files[0].name;
		this.originalImage.nativeElement.src = URL.createObjectURL(event.target.files[0]);
	}

	public doRestore() {
		const mat = cv.imread(this.originalImage.nativeElement);
		cv.imshow('imageCanvas', mat);
		mat.delete();
	}

	public doSave() {
		const canvas: any = document.getElementById('imageCanvas');

		const image = canvas.toDataURL('image/png')
			.replace('image/png', 'image/octet-stream');  // here is the most important part because if you dont replace you will get a DOM 18 exception.
		window.location.href = image;
	}

	public doChangeColor() {
		this.disabled = true;

		const mat = cv.imread('imageCanvas');
		const dst = mat.clone();
		cv.cvtColor(dst, dst, cv.COLOR_BGR2RGB);
		cv.imshow('imageCanvas', dst);
		mat.delete();
		dst.delete();
		this.disabled = false;
	}

	public doCanny() {
		this.disabled = true;

		const src = cv.imread('imageCanvas');
		const dst = new cv.Mat();
		cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
		// You can try more different parameters
		cv.Canny(src, dst, 50, 100, 3, false);
		cv.imshow('imageCanvas', dst);
		src.delete();
		dst.delete();
		this.disabled = false;
	}

	public doContour() {
		this.disabled = true;

		const src = cv.imread('imageCanvas');
		const dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
		cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
		cv.threshold(src, src, 35, 200, cv.THRESH_BINARY);
		const contours = new cv.MatVector();
		const hierarchy = new cv.Mat();
		// You can try more different parameters
		cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
		// draw contours with random Scalar
		for (let i = 0; i < contours.size(); ++i) {
			const color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
				Math.round(Math.random() * 255));
			// To fill the contour area, use cv.FILLED as the thickness value (after the color)
			// cv.drawContours(dst, contours, i, color, cv.FILLED, cv.LINE_8, hierarchy, 100);
			cv.drawContours(dst, contours, i, color, 2, cv.LINE_8, hierarchy, 100);
		}
		cv.imshow('imageCanvas', dst);
		src.delete();
		dst.delete();
		contours.delete();
		hierarchy.delete();
		this.disabled = false;
	}

	public doGaussianBlur() {
		this.disabled = true;

		const src = cv.imread('imageCanvas');
		const dst = new cv.Mat();
		const ksize = new cv.Size(11, 11);

		cv.GaussianBlur(src, dst, ksize, 0, 0, cv.BORDER_DEFAULT);
		cv.imshow('imageCanvas', dst);
		src.delete();
		dst.delete();
		this.disabled = false;
	}

	public doPreview() {
		this.disabled = true;
		const max_prct = 0.15;

		const src = cv.imread('imageCanvas');
		let dst = this.new_green_layer(src);
		cv.imshow('imageCanvas', dst);

		src.delete();
		dst.delete();
		this.disabled = false;
	}

	public new_green_layer(src, clean_prct = 0.05) {
		const rgbaPlanes = new cv.MatVector();
		// Split the Mat
		cv.split(src, rgbaPlanes);
		// Get Blue channel
		const green = rgbaPlanes.get(1);

		const dst = this.thresh_image(green, clean_prct);

		for (let i = 0; i < green.length; i++) {
			for (let j = 0; j < green[i].length; j++) {

				green[i] = green[i][j] & dst[i][j];
			}
		}
		return green;
	}

	public new_blue_layer(src) {
		const rgbaPlanes = new cv.MatVector();
		// Split the Mat
		cv.split(src, rgbaPlanes);
		// Get Blue channel
		const blue = rgbaPlanes.get(2);

		const dst = this.thresh_image(blue);

		for (let i = 0; i < blue.length; i++) {
			for (let j = 0; j < blue[i].length; j++) {

				blue[i] = blue[i][j] & dst[i][j];
			}
		}
		return blue;
	}

	public thresh_image(src, max_prct = 0.15, ero_dia_iter = 1, erode_iter = 2, dilate_iter = 2) {

		const dst = new cv.Mat();

		cv.threshold(src, dst, max_prct * 255, 255, cv.THRESH_BINARY);

		const ksize = new cv.Size(11, 11);
		cv.GaussianBlur(dst, dst, ksize, 0, 0, cv.BORDER_DEFAULT);

		let M = cv.Mat.ones(3, 3, cv.CV_8U);

		for (let i = 0; i < ero_dia_iter; i++) {
			cv.erode(dst, dst, M, new cv.Point(-1, -1), erode_iter);
			cv.dilate(dst, dst, M, new cv.Point(-1, -1), dilate_iter);
		}
		return dst;
	}
}
