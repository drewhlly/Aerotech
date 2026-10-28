export function distanceMeters(lat1:number,lon1:number,lat2:number,lon2:number){
 const rad=Math.PI/180,earth=6371000;
 const dlat=(lat2-lat1)*rad,dlon=(lon2-lon1)*rad;
 const a=Math.sin(dlat/2)**2+Math.cos(lat1*rad)*Math.cos(lat2*rad)*Math.sin(dlon/2)**2;
 return 2*earth*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
export function validateGeofence(latitude:number,longitude:number,accuracy:number,site:{latitude:number;longitude:number;radius_m:number}){
 if(![latitude,longitude,accuracy].every(Number.isFinite)||Math.abs(latitude)>90||Math.abs(longitude)>180||accuracy<0||accuracy>100)throw Error("Reliable GPS location required (accuracy within 100 metres).");
 const distance=distanceMeters(latitude,longitude,site.latitude,site.longitude);
 // An uncertain location near the edge must be checked rather than accepted.
 if(distance+accuracy>site.radius_m)throw Error("Outside the approved workplace or GPS accuracy is insufficient.");
 return distance;
}
