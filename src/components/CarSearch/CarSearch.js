import React from "react";
import { useQuery, gql } from "@apollo/client";
import { CallToActionButton } from "../CallToActionButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTag } from "@fortawesome/free-solid-svg-icons";
import numeral from "numeral";
import { PageNumber } from "./PageNumber";
import { navigate } from "gatsby";

export const CarSearch = ({ style, className }) => {
  const pageSize = 3;
  let page = 1;
  let defaultMaxPrice = "";
  let defaultMinPrice = "";
  let defaultColor = "";

  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    page = parseInt(params.get("page") || "1");
    defaultColor = params.get("color");
    defaultMaxPrice = params.get("maxPrice");
    defaultMinPrice = params.get("minPrice");
  }

  let metaQuery = "{}";
  if (defaultColor || defaultMaxPrice || defaultMinPrice) {
    let colorQuery = "";
    let minPriceQuery = "";
    let maxPriceQuery = "";

    if (defaultColor) {
      colorQuery = `{key: "color", compare: EQUAL_TO, value: "${defaultColor}"},`;
    }

    if (defaultMinPrice) {
      minPriceQuery = `{key: "price", compare: GREATER_THAN_OR_EQUAL_TO, type: NUMERIC value: "${defaultMinPrice}"},`;
    }
    if (defaultMaxPrice) {
      maxPriceQuery = `{key: "price", compare: LESS_THAN_OR_EQUAL_TO, type: NUMERIC value: "${defaultMaxPrice}"},`;
    }

    metaQuery = `{
      relation: AND
      metaArray: [${colorQuery}${minPriceQuery}${maxPriceQuery}]
    }`;
  }

  const { data, loading } = useQuery(
    gql`
      query CarsQuery($size: Int!, $offset: Int!) {
        cars(where: {metaQuery: ${metaQuery}, offsetPagination: { size: $size, offset: $offset } }) {
          nodes {
            databaseId
            title
            uri
            featuredImage {
              node {
                sourceUrl(size: LARGE)
              }
            }
            carDetails {
              price
            }
          }
          pageInfo {
            offsetPagination {
              total
            }
          }
        }
      }
    `,
    {
      variables: {
        size: pageSize,
        offset: pageSize * (page - 1),
      },
    }
  );

  const totalResults = data?.cars?.pageInfo?.offsetPagination?.total || 0;
  const totalPages = Math.ceil(totalResults / pageSize);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const params = new URLSearchParams(formData);
    params.set("page", "1");
    navigate(`${window.location.pathname}?${params.toString()}`);
    console.log(data);
  };

  return (
    <div className={`${className} w-full`} style={style}>
      <fieldset>
        <form
          onSubmit={handleSubmit}
          className="mb-4 grid grid-cols-1 gap-4 bg-stone-200 p-4 md:grid-cols-[1fr_1fr_1fr_110px]"
        >
          <div>
            <strong>Min Price</strong>
            <input
              defaultValue={defaultMinPrice}
              type="number"
              name="minPrice"
            />
          </div>
          <div>
            <strong>Max Price</strong>
            <input
              defaultValue={defaultMaxPrice}
              type="number"
              name="maxPrice"
            />
          </div>
          <div>
            <strong>Color</strong>
            <select defaultValue={defaultColor} name="color">
              <option value="">Any Color</option>
              <option value="red">Red</option>
              <option value="white">White</option>
              <option value="green">Green</option>
            </select>
          </div>
          <div className="flex">
            <button className="btn mt-auto mb-[2px]" type="submit">
              Submit
            </button>
          </div>
        </form>
      </fieldset>
      {!loading && !!data?.cars?.nodes?.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {data.cars.nodes.map((car) => (
            <div
              className="flex flex-col border border-stone-200 bg-stone-100 p-2"
              key={car.databaseId}
            >
              {!!car.featuredImage?.node?.sourceUrl && (
                <img
                  className="h-[200px] w-full object-cover"
                  src={car.featuredImage.node.sourceUrl}
                  alt=""
                />
              )}
              <div className="my-2 justify-between gap-2 font-heading text-xl font-bold lg:flex">
                <div className="my-2">{car.title}</div>
                <div className="text-right">
                  <div className="inline-block whitespace-nowrap bg-emerald-900 p-2 text-white">
                    <FontAwesomeIcon icon={faTag} />£
                    {numeral(car.carDetails.price).format("0,0")}
                  </div>
                </div>
              </div>
              <div>
                <CallToActionButton
                  fullWidth
                  label="View More Details"
                  destination={car.uri}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>gaada</div>
      )}
      {!!totalResults && (
        <div className="my-4 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => {
            return <PageNumber key={i} pageNumber={i + 1} />;
          })}
        </div>
      )}
    </div>
  );
};
